from rest_framework import permissions

class IsEmployerOrCompanyOrReadOnly(permissions.BasePermission):
    def _get_role(self, user):
        if not user or not user.is_authenticated:
            return None
        return getattr(user, "job_role", None)

    def has_permission(self, request, view):
        # everyone can read
        if request.method in permissions.SAFE_METHODS:
            return True
        role = self._get_role(request.user)
        return role in ("Employer", "Company")

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # only publisher can modify/delete
        return obj.publisher == request.user and self.has_permission(request, view)