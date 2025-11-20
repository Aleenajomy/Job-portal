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
from django.conf import settings
from django.utils import timezone
import uuid

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    image = models.ImageField(upload_to='profiles/%Y/%m/%d/', blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    experience_years = models.IntegerField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.email}'s Profile"