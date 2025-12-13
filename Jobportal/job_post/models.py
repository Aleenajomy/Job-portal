from django.db import models
from django.utils import timezone
from accounts.models import User

class JobPost(models.Model):
    JOB_TYPE_CHOICES = [
        ('fulltime', 'Full time'),
        ('parttime', 'Part time'),
        ('intern', 'Intern'),
    ]
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    requirements = models.JSONField(default=list, blank=True)  # Required skills as list
    location = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='fulltime', db_index=True)
    work_mode = models.CharField(max_length=20, choices=[('remote','Remote'),('hybrid','Hybrid'),('onsite','On-site')], default='onsite', db_index=True)
    
    publisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    publisher_role = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_applied = models.BooleanField(default=False)
    
    @property
    def company_name(self):
        # For Company users - get from CompanyProfile
        if self.publisher.job_role == 'Company':
            try:
                return self.publisher.companyprofile.company_name
            except:
                return "Unknown Company"
        
        # For Employer users - get from UserProfile
        elif self.publisher.job_role == 'Employer':
            try:
                return self.publisher.userprofile.company_name or "Unknown Company"
            except:
                return "Unknown Company"
        
        # For Employee users (shouldn't post jobs, but just in case)
        else:
            return "Unknown Company"
    
    def __str__(self):
        return f"{self.title} by {self.company_name}"

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('shortlisted', 'Shortlisted'),
        ('resume_review', 'Resume Review'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('interviewed', 'Interviewed'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    
    applied_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('job', 'applicant')  # Prevent duplicate applications
    
    def __str__(self):
        return f"{self.applicant_name} applied for {self.job.title}"