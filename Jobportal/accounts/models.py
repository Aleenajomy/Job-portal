from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import random

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractUser):
    objects = UserManager()
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    
    JOB_ROLE_CHOICES = [
        ('Employee', 'Employee'),
        ('Employer', 'Employer'),
        ('Company', 'Company'),
    ]
    job_role = models.CharField(max_length=50, choices=JOB_ROLE_CHOICES, default='Employee')
    otp = models.CharField(max_length=6, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.save()
        return self.otp
