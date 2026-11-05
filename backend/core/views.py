from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Job, JobApplication
from .serializers import UserSerializer, JobSerializer, JobApplicationSerializer
from .permissions import IsOwnerOrReadOnly


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = Job.objects.filter(is_active=True).select_related("posted_by")
        params = self.request.query_params
        search = params.get("search", "").strip()
        location = params.get("location", "").strip()
        category = params.get("category", "").strip()
        job_type = params.get("job_type", "").strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(company__icontains=search) |
                Q(description__icontains=search) | Q(category__icontains=search)
            )
        if location:
            qs = qs.filter(location__icontains=location)
        if category:
            qs = qs.filter(category__icontains=category)
        if job_type:
            qs = qs.filter(job_type=job_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(posted_by=self.request.user)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user).select_related("job", "applicant")

    def perform_create(self, serializer):
        job = serializer.validated_data["job"]
        if not job.is_active:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"job": "This job is no longer accepting applications."})
        if JobApplication.objects.filter(job=job, applicant=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"job": "You have already applied for this job."})
        serializer.save(applicant=self.request.user)
