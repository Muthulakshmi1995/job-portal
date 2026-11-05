from django.conf import settings
from django.db import models


class Job(models.Model):
    JOB_TYPES = [
        ("Full-time", "Full-time"),
        ("Part-time", "Part-time"),
        ("Contract", "Contract"),
        ("Internship", "Internship"),
        ("Remote", "Remote"),
    ]
    title = models.CharField(max_length=180)
    company = models.CharField(max_length=150)
    location = models.CharField(max_length=120)
    category = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=30, choices=JOB_TYPES, default="Full-time")
    salary = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posted_jobs")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} at {self.company}"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Submitted", "Submitted"),
        ("Reviewing", "Reviewing"),
        ("Shortlisted", "Shortlisted"),
        ("Rejected", "Rejected"),
    ]
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="job_applications")
    resume = models.FileField(upload_to="resumes/")
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Submitted")
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(fields=["job", "applicant"], name="unique_applicant_per_job")
        ]

    def __str__(self):
        return f"{self.applicant.username} - {self.job.title}"
