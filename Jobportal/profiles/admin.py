from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'experience_years']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
