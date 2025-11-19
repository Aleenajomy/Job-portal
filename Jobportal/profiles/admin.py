from django.contrib import admin
from .models import Profile, Skill

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    filter_horizontal = ['skills']
