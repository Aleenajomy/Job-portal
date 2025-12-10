from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'create':
            return request.user and request.user.is_authenticated
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class IsCommentOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsPostOwnerOrCommentOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Comment author can delete
        if obj.user == request.user:
            return True
        # Post owner can delete comments on their posts
        if obj.post.author == request.user:
            return True
        # Admin/staff can delete any comment
        if request.user.is_staff:
            return True
        return False