from rest_framework import serializers
from .models import JobPost, JobApplication
from .utils import get_applicant_name, convert_to_pdf, send_application_email
import os

class JobPostListSerializer(serializers.ModelSerializer):
    publisher_name = serializers.SerializerMethodField()
    publisher_email = serializers.CharField(source="publisher.email", read_only=True)
    publisher_role = serializers.SerializerMethodField()
    company_name = serializers.ReadOnlyField()
    total_applicants = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = ("id", "title", "salary", "experience", "company_name", "publisher", "publisher_name", "publisher_email", "publisher_role", "job_type", "work_mode", "location", "requirements", "total_applicants", "created_at")

    def get_publisher_name(self, obj):
        return f"{obj.publisher.first_name} {obj.publisher.last_name}"
    
    def get_publisher_role(self, obj):
        return obj.publisher_role or getattr(obj.publisher, "job_role", None)
    
    def get_total_applicants(self, obj):
        return obj.applications.count()

class JobPostDetailSerializer(serializers.ModelSerializer):
    publisher_name = serializers.SerializerMethodField()
    publisher_email = serializers.CharField(source="publisher.email", read_only=True)
    publisher_role = serializers.SerializerMethodField()
    publisher_phone = serializers.SerializerMethodField()
    publisher_profile_img = serializers.SerializerMethodField()
    company_name = serializers.ReadOnlyField()

    class Meta:
        model = JobPost
        fields = (
            "id", "title", "description", "requirements", "company_name", "location", "salary", "experience", "job_type", "work_mode",
            "publisher", "publisher_name", "publisher_email", "publisher_role", "publisher_phone", "publisher_profile_img",
            "created_at", "updated_at", "is_active", "is_applied"
        )
        read_only_fields = ("company_name", "publisher_name", "publisher_email", "publisher_role", "created_at", "updated_at")
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False},
            'requirements': {'required': False},
            'location': {'required': False},
            'salary': {'required': False},
            'experience': {'required': False},
            'job_type': {'required': False},
            'work_mode': {'required': False},
        }

    def get_publisher_name(self, obj):
        return f"{obj.publisher.first_name} {obj.publisher.last_name}"
    
    def get_publisher_role(self, obj):
        return obj.publisher_role or getattr(obj.publisher, "job_role", None)
    
    def get_publisher_phone(self, obj):
        try:
            if obj.publisher.job_role == 'Company':
                return obj.publisher.companyprofile.company_phone
            else:
                return obj.publisher.userprofile.phone
        except:
            return None
    
    def get_publisher_profile_img(self, obj):
        try:
            if obj.publisher.job_role == 'Company':
                if obj.publisher.companyprofile.company_logo:
                    return obj.publisher.companyprofile.company_logo.url
            else:
                if obj.publisher.userprofile.profile_image:
                    return obj.publisher.userprofile.profile_image.url
        except:
            pass
        return None
    
    def update(self, instance, validated_data):
        # Only update fields that are provided
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(read_only=True)
    applicant_email = serializers.EmailField(read_only=True)
    
    class Meta:
        model = JobApplication
        fields = ['job', 'resume', 'cover_letter', 'applicant_name', 'applicant_email', 'applied_at']
        read_only_fields = ['applicant_name', 'applicant_email', 'applied_at']
    
    def validate_resume(self, value):
        """Validate resume file type"""
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_extension = os.path.splitext(value.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError("Resume must be PDF, DOC, or DOCX format")
        
        # Check file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Resume file size must be less than 5MB")
        
        return value
    
    def validate(self, data):
        """Validate application rules"""
        user = self.context['request'].user
        job = data['job']
        
        # Check if user is the job publisher
        if job.publisher == user:
            raise serializers.ValidationError("You cannot apply to your own job")
        
        # Check if user already applied
        if JobApplication.objects.filter(job=job, applicant=user).exists():
            raise serializers.ValidationError("You have already applied to this job")
        
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        # Auto-fill applicant details
        validated_data['applicant'] = user
        validated_data['applicant_name'] = get_applicant_name(user)
        validated_data['applicant_email'] = user.email
        
        # Create application
        application = JobApplication.objects.create(**validated_data)
        
        # Convert resume to PDF if needed
        pdf_resume = convert_to_pdf(application.resume)
        if pdf_resume != application.resume:
            application.resume_pdf = pdf_resume
            application.save()
        
        # Send email notification
        try:
            send_application_email(application)
        except Exception as e:
            # Log error but don't fail the application
            pass
        
        return application

class MyApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company_name', read_only=True)
    job_location = serializers.CharField(source='job.location', read_only=True)
    job_salary = serializers.CharField(source='job.salary', read_only=True)
    job_experience = serializers.CharField(source='job.experience', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = ['id', 'job_title', 'job_company', 'job_location', 'job_salary', 'job_experience', 'applied_at', 'cover_letter']

class ApplicationListSerializer(serializers.ModelSerializer):
    job = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applicant_name', 'applicant_email', 'status', 'applied_at', 'resume_url', 'cover_letter']
    
    def get_job(self, obj):
        return {
            'id': obj.job.id,
            'title': obj.job.title,
            'company_name': obj.job.company_name
        }
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None

class ApplicationDetailSerializer(serializers.ModelSerializer):
    job = JobPostDetailSerializer(read_only=True)
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applicant', 'applicant_name', 'applicant_email', 'resume_url', 'cover_letter', 'applied_at']
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None

class ApplicantSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = ['id', 'applicant_name', 'applicant_email', 'status', 'resume_url', 'cover_letter', 'applied_at']
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None