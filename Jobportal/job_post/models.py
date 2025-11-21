from django.db import models
from django.utils import timezone
from accounts.models import User

class JobPost(models.Model):
    JOB_TYPE_CHOICES = [
        ('fulltime', 'Full time'),
        ('parttime', 'Part time'),
        ('intern', 'Intern'),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    company_name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='fulltime')
    
    publisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    publisher_role = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_applied = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.title} by {self.publisher.email}"