from django.db import models
from django.utils import timezone
from accounts.models import User

class JobPost(models.Model):
    JOB_TYPE_CHOICES = [
        ('fulltime', 'Full-time'),
        ('parttime', 'Part-time'),
        ('intern', 'Intern'),
    ]
    WORK_MODE_CHOICES = [
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
        ('onsite', 'On-site'),
    ]
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    requirements = models.JSONField(default=list, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='fulltime', db_index=True)
    work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, default='onsite', db_index=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    
    publisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    publisher_role = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    application_count = models.PositiveIntegerField(default=0)
    
    def get_company_name(self):
        # If company_name is stored in job, use it
        if self.company_name:
            return self.company_name
        
        # For Company users - use company profile name or user name
        if self.publisher.job_role == 'Company':
            try:
                if hasattr(self.publisher, 'companyprofile'):
                    return self.publisher.companyprofile.company_name
            except:
                pass
            return f"{self.publisher.first_name} {self.publisher.last_name}".strip() or "Company Name"
        
        # For Employer users - try to get from user profile or use name
        if self.publisher.job_role == 'Employer':
            try:
                if hasattr(self.publisher, 'userprofile') and self.publisher.userprofile.company_name:
                    return self.publisher.userprofile.company_name
            except:
                pass
            return f"{self.publisher.first_name} {self.publisher.last_name}".strip() or "Company Name"
        
        return "Company Name"
    
    def save(self, *args, **kwargs):
        if self.pk is None and self.is_active is None:
            self.is_active = True
        super().save(*args, **kwargs)
    
    def soft_delete(self):
        """Soft delete job by setting deleted_at timestamp"""
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save()
    
    def activate(self):
        """Activate job"""
        self.is_active = True
        self.deleted_at = None
        self.save()
    
    def deactivate(self):
        """Deactivate job without deleting"""
        self.is_active = False
        self.save()
    
    def increment_application_count(self):
        """Increment application count"""
        self.application_count += 1
        self.save(update_fields=['application_count'])
    
    def __str__(self):
        return f"{self.title} by {self.company_name}"

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewing', 'Reviewing'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    ]
    
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    
    # Auto-filled fields
    applicant_name = models.CharField(max_length=255)
    applicant_email = models.EmailField()
    
    # Required fields
    resume = models.FileField(upload_to='resumes/')
    resume_pdf = models.FileField(upload_to='resumes/pdf/', blank=True, null=True)
    
    # Optional field
    cover_letter = models.TextField(blank=True, null=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    
    applied_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('job', 'applicant')  # Prevent duplicate applications
    
    def __str__(self):
        return f"{self.applicant_name} applied for {self.job.title}"