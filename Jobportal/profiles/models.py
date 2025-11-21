# from django.db import models
# from accounts.models import User

# class Skill(models.Model):
#     name = models.CharField(max_length=100, unique=True)
    
#     def __str__(self):
#         return self.name

# class Profile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     phone = models.CharField(max_length=15, blank=True)
#     address = models.TextField(max_length=300, blank=True)
#     skills = models.ManyToManyField(Skill, blank=True)
#     experience_years = models.PositiveIntegerField(default=0)
#     profile_img = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    
#     def __str__(self):
#         return f"{self.user.first_name} {self.user.last_name}'s Profile"

from django.db import models
from accounts.models import User

# Profile for Employee & Employer (shared)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Shared fields
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    # Employee/Employer specific fields
    skills = models.TextField(null=True, blank=True)  # Employee-specific
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
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField()
    company_phone = models.CharField(max_length=20)
    company_website = models.URLField(null=True, blank=True)
    company_address = models.CharField(max_length=255)
    company_description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return self.company_name