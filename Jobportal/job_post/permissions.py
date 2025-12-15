from rest_framework import permissions

class IsEmployerOrCompanyOrReadOnly(permissions.BasePermission):
    """Only Employers and Companies can create/modify jobs"""
    
    def _get_role(self, user):
        if not user or not user.is_authenticated:
            return None
        return getattr(user, "job_role", None)

    def has_permission(self, request, view):
        # Everyone can read
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users can create/modify
        if not request.user or not request.user.is_authenticated:
            return False
            
        role = self._get_role(request.user)
        # Only Employers and Companies can create/modify jobs
        return role in ("Employer", "Company")

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only publisher can modify/delete their own jobs
        return obj.publisher == request.user and self.has_permission(request, view)

class CanApplyToJob(permissions.BasePermission):
    """Employee & Employer can apply for jobs, but Company cannot. Users cannot apply to their own jobs."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        role = getattr(request.user, 'job_role', None)
        # Only Employee and Employer can apply for jobs, Company cannot
        return role in ('Employee', 'Employer')
    
    def has_object_permission(self, request, view, obj):
        # Users cannot apply to their own jobs
        return obj.publisher != request.user