from django.contrib import admin
from .models import Job, JobApplication


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "location", "job_type", "posted_by", "is_active", "created_at")
    list_filter = ("job_type", "category", "is_active", "created_at")
    search_fields = ("title", "company", "location", "description")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "applicant", "status", "applied_at")
    list_filter = ("status", "applied_at")
    search_fields = ("job__title", "applicant__username")
