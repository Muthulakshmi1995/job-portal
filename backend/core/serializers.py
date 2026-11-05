from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Job, JobApplication


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class JobSerializer(serializers.ModelSerializer):
    posted_by_username = serializers.CharField(source="posted_by.username", read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "company", "location", "category", "job_type",
            "salary", "description", "requirements", "posted_by",
            "posted_by_username", "created_at", "is_active",
        ]
        read_only_fields = ["posted_by", "created_at"]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Job title is required.")
        return value.strip()


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company = serializers.CharField(source="job.company", read_only=True)
    applicant_username = serializers.CharField(source="applicant.username", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id", "job", "job_title", "company", "applicant",
            "applicant_username", "resume", "cover_letter", "status", "applied_at",
        ]
        read_only_fields = ["applicant", "status", "applied_at"]
