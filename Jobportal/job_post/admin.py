from django.contrib import admin
from .models import JobPost

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ("title", "publisher", "publisher_role", "job_type", "is_active", "created_at")
    search_fields = ("title", "publisher__email", "publisher__first_name", "publisher__last_name")
    list_filter = ("job_type", "publisher_role", "is_active")
    readonly_fields = ("id", "created_at", "updated_at")
