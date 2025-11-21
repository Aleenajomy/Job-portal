from django.contrib import admin
from .models import UserProfile, CompanyProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'experience_years']
    search_fields = ['user__email', 'full_name']
    list_filter = ['user__job_role']

@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'company_email', 'company_logo']
    search_fields = ['user__email', 'company_name']
