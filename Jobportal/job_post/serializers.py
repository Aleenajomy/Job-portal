from rest_framework import serializers
from .models import JobPost, JobApplication
from .utils import get_applicant_name, convert_to_pdf
import os

class JobPostListSerializer(serializers.ModelSerializer):
    publisher_id = serializers.IntegerField(source='publisher.id', read_only=True)
    publisher_name = serializers.SerializerMethodField()
    publisher_email = serializers.CharField(source="publisher.email", read_only=True)
    publisher_role = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    is_following_company = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = (
            "id", "title", "description", "salary", "experience", "company_name", "publisher", "publisher_id",
            "publisher_name", "publisher_email", "publisher_role", "job_type", 
            "work_mode", "location", "requirements", "application_count", "created_at", "is_active", "has_applied", "is_following_company"
        )

    def get_publisher_name(self, obj):
        from django.utils.html import escape
        first_name = escape(obj.publisher.first_name or '')
        last_name = escape(obj.publisher.last_name or '')
        return f"{first_name} {last_name}".strip()
    
    def get_publisher_role(self, obj):
        try:
            return obj.publisher_role or getattr(obj.publisher, "job_role", None)
        except AttributeError:
            return None
    
    def get_company_name(self, obj):
        # First try the stored company_name field
        if obj.company_name:
            return obj.company_name
        
        # For Company users - use first_name + last_name as company name
        if obj.publisher.job_role == 'Company':
            return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip() or "Company Name"
        
        # For Employer users - try to get from user profile or use name
        if obj.publisher.job_role == 'Employer':
            try:
                if hasattr(obj.publisher, 'userprofile') and obj.publisher.userprofile.company_name:
                    return obj.publisher.userprofile.company_name
            except:
                pass
            return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip() or "Company Name"
        
        return "Company Name"
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return JobApplication.objects.filter(job=obj, applicant=request.user).exists()
        return False
    
    def get_is_following_company(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        try:
            from follows.models import Follow
            return Follow.objects.filter(follower=request.user, following=obj.publisher).exists()
        except ImportError:
            return False
    


class JobPostDetailSerializer(serializers.ModelSerializer):
    publisher_id = serializers.IntegerField(source='publisher.id', read_only=True)
    publisher_name = serializers.SerializerMethodField()
    publisher_email = serializers.CharField(source="publisher.email", read_only=True)
    publisher_role = serializers.SerializerMethodField()
    publisher_phone = serializers.SerializerMethodField()
    publisher_profile_img = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    is_following_company = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = (
            "id", "title", "description", "requirements", "company_name", "location", "salary", "experience", "job_type", "work_mode",
            "publisher", "publisher_id", "publisher_name", "publisher_email", "publisher_role", "publisher_phone", "publisher_profile_img",
            "created_at", "updated_at", "is_active", "application_count", "has_applied", "is_following_company"
        )
        read_only_fields = ("publisher", "publisher_name", "publisher_email", "publisher_role", "created_at", "updated_at")
        extra_kwargs = {
            # Job details - optional fields
            'requirements': {'required': False},
            'location': {'required': False},
            'salary': {'required': False},
            'experience': {'required': False},
            'company_name': {'required': False},
            # Job type and mode - optional fields
            'job_type': {'required': False},
            'work_mode': {'required': False},
        }

    def get_publisher_name(self, obj):
        from django.utils.html import escape
        first_name = escape(obj.publisher.first_name or '')
        last_name = escape(obj.publisher.last_name or '')
        return f"{first_name} {last_name}".strip()
    
    def get_publisher_role(self, obj):
        try:
            return obj.publisher_role or getattr(obj.publisher, "job_role", None)
        except AttributeError:
            return None
    
    def get_publisher_phone(self, obj):
        try:
            if obj.publisher.job_role == 'Company':
                if hasattr(obj.publisher, 'companyprofile'):
                    return obj.publisher.companyprofile.company_phone
            else:
                if hasattr(obj.publisher, 'userprofile'):
                    return obj.publisher.userprofile.phone
        except (AttributeError, Exception) as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting publisher phone for job {obj.id}: {str(e)}")
        return None
    
    def get_company_name(self, obj):
        # First try the stored company_name field
        if obj.company_name:
            return obj.company_name
        
        # For Company users - use first_name + last_name as company name
        if obj.publisher.job_role == 'Company':
            return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip() or "Company Name"
        
        # For Employer users - try to get from user profile or use name
        if obj.publisher.job_role == 'Employer':
            try:
                if hasattr(obj.publisher, 'userprofile') and obj.publisher.userprofile.company_name:
                    return obj.publisher.userprofile.company_name
            except:
                pass
            return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip() or "Company Name"
        
        return "Company Name"
    
    def get_publisher_profile_img(self, obj):
        try:
            if obj.publisher.job_role == 'Company':
                if hasattr(obj.publisher, 'companyprofile') and obj.publisher.companyprofile.company_logo:
                    return obj.publisher.companyprofile.company_logo.url
            else:
                if hasattr(obj.publisher, 'userprofile') and obj.publisher.userprofile.profile_image:
                    return obj.publisher.userprofile.profile_image.url
        except (AttributeError, Exception) as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting publisher profile image for job {obj.id}: {str(e)}")
        return None
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return JobApplication.objects.filter(job=obj, applicant=request.user).exists()
        return False
    
    def get_is_following_company(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        try:
            from follows.models import Follow
            return Follow.objects.filter(follower=request.user, following=obj.publisher).exists()
        except ImportError:
            return False
    
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
    
    def _is_safe_filename(self, filename):
        """Check if filename is safe from path traversal and invalid characters"""
        import re
        return not (
            re.search(r'[.]{2,}', filename) or
            '/' in filename or '\\' in filename or
            filename.startswith('.') or
            any(char in filename for char in ['<', '>', ':', '"', '|', '?', '*']) or
            filename.lower() in ['con', 'prn', 'aux', 'nul'] or
            re.match(r'^(com|lpt)[0-9]$', filename.lower())
        )
    
    def validate_resume(self, value):
        """Validate resume file type"""
        allowed_extensions = ['.pdf', '.doc', '.docx']
        filename = os.path.basename(value.name)
        
        if not self._is_safe_filename(filename):
            raise serializers.ValidationError("Invalid filename")
        
        file_extension = os.path.splitext(filename)[1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError("Resume must be PDF, DOC, or DOCX format")
        
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
        
        # Increment job application count
        application.job.increment_application_count()
        
        # Convert resume to PDF if needed
        try:
            pdf_resume = convert_to_pdf(application.resume)
            if pdf_resume != application.resume:
                application.resume_pdf = pdf_resume
                application.save()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to convert resume to PDF: {str(e)}")
        
        # Email notification removed as per requirement
        
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
            'company_name': obj.job.get_company_name(),
            'location': obj.job.location,
            'salary': obj.job.salary,
            'experience': obj.job.experience,
            'job_type': obj.job.job_type,
            'work_mode': obj.job.work_mode
        }
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None

class ApplicationDetailSerializer(serializers.ModelSerializer):
    job = JobPostDetailSerializer(read_only=True)
    resume_url = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applicant', 'applicant_name', 'applicant_email', 'resume_url', 'profile_image', 'cover_letter', 'applied_at']
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None
    
    def get_profile_image(self, obj):
        try:
            request = self.context.get('request')
            if hasattr(obj.applicant, 'userprofile') and obj.applicant.userprofile.profile_image:
                if request:
                    return request.build_absolute_uri(obj.applicant.userprofile.profile_image.url)
                return obj.applicant.userprofile.profile_image.url
        except (AttributeError, ValueError):
            pass
        return None

class ApplicantSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = ['id', 'applicant_name', 'applicant_email', 'status', 'resume_url', 'cover_letter', 'applied_at']
    
    def get_resume_url(self, obj):
        try:
            return obj.resume.url if obj.resume else None
        except (AttributeError, ValueError):
            return None