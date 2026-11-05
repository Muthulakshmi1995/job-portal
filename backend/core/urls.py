from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, JobViewSet, JobApplicationViewSet

router = DefaultRouter()
router.register("jobs", JobViewSet, basename="job")
router.register("applications", JobApplicationViewSet, basename="application")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("", include(router.urls)),
]
