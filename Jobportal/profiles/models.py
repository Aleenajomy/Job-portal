from django.db import models
from accounts.models import User

def default_skills():
    return []

class Education(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='education')
    school = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255, blank=True)
    start_year = models.IntegerField()
    end_year = models.IntegerField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-end_year', '-start_year']

    def __str__(self):
        return f"{self.degree} at {self.school}"

# Profile for Employee & Employer (shared)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Shared fields
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    # Employee/Employer specific fields
    skills = models.JSONField(default=default_skills, blank=True)  # Employee-specific
    education_summary = models.TextField(null=True, blank=True)  # Simple education text
    experience_years = models.IntegerField(null=True, blank=True)
    company_name = models.CharField(max_length=255, null=True, blank=True)  # Employer-specific
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}"
    
    def __str__(self):
        return f"{self.full_name} Profile"

# Profile for Company only
class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    company_logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    company_email = models.EmailField(blank=True)
    company_phone = models.CharField(max_length=20, blank=True)
    company_website = models.URLField(null=True, blank=True)
    company_address = models.CharField(max_length=255, blank=True)
    company_description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return self.company_name or f"{self.user.first_name} {self.user.last_name}"