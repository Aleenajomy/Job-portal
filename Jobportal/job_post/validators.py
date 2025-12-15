"""
Role-based access control validators for job portal
"""
from rest_framework.exceptions import PermissionDenied
from django.core.exceptions import ValidationError


class RoleValidator:
    """Centralized role validation for job portal operations"""
    
    @staticmethod
    def can_create_job(user):
        """Check if user can create/modify jobs"""
        if not user or not user.is_authenticated:
            return False, "Authentication required"
        
        role = getattr(user, 'job_role', None)
        if role not in ('Employer', 'Company'):
            return False, f"Only Employers and Companies can create jobs. Your role: {role}"
        
        return True, "Access granted"
    
    @staticmethod
    def can_apply_to_job(user, job=None):
        """Check if user can apply to jobs"""
        if not user or not user.is_authenticated:
            return False, "Authentication required"
        
        role = getattr(user, 'job_role', None)
        
        # Role-based validation
        if role == 'Company':
            return False, "Companies cannot apply for jobs. You can only post jobs and view applicants."
        
        if role not in ('Employee', 'Employer'):
            return False, f"Only Employees and Employers can apply for jobs. Your role: {role}"
        
        # Job-specific validation
        if job:
            if job.publisher == user:
                return False, "You cannot apply to your own job posting"
            
            if not job.is_active:
                return False, "This job is no longer active"
        
        return True, "Access granted"
    
    @staticmethod
    def validate_job_creation(user):
        """Validate job creation and raise exception if not allowed"""
        can_create, message = RoleValidator.can_create_job(user)
        if not can_create:
            raise PermissionDenied(message)
    
    @staticmethod
    def validate_job_application(user, job):
        """Validate job application and raise exception if not allowed"""
        can_apply, message = RoleValidator.can_apply_to_job(user, job)
        if not can_apply:
            raise PermissionDenied(message)


class JobAccessControl:
    """Job-specific access control utilities"""
    
    @staticmethod
    def get_user_permissions(user):
        """Get user permissions based on role"""
        if not user or not user.is_authenticated:
            return {
                'can_create_jobs': False,
                'can_apply_to_jobs': False,
                'can_view_applications': False,
                'role': None
            }
        
        role = getattr(user, 'job_role', None)
        
        return {
            'can_create_jobs': role in ('Employer', 'Company'),
            'can_apply_to_jobs': role in ('Employee', 'Employer'),
            'can_view_applications': role in ('Employer', 'Company'),
            'role': role
        }
    
    @staticmethod
    def filter_jobs_for_user(queryset, user):
        """Filter jobs based on user permissions"""
        # All users can view active jobs
        return queryset.filter(is_active=True)
    
    @staticmethod
    def can_manage_job(user, job):
        """Check if user can manage (edit/delete) a specific job"""
        if not user or not user.is_authenticated:
            return False
        
        # Only job publisher can manage their jobs
        return job.publisher == user and getattr(user, 'job_role', None) in ('Employer', 'Company')