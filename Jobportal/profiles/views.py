import os
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.db.models import Count
from .models import UserProfile, CompanyProfile
from .serializers import UserProfileSerializer, CompanyProfileSerializer, PublicUserSerializer, PublicUserProfileSerializer
from .permissions import IsCompany, IsEmployeeOrEmployer
from accounts.models import User

class BaseProfileView(generics.RetrieveUpdateAPIView):
    """Base class for profile views with common update logic"""
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Validate file paths to prevent path traversal
        validated_data = request.data.copy()
        for key, value in validated_data.items():
            if hasattr(value, 'name') and value.name:
                filename = os.path.basename(value.name)
                if '..' in filename or '/' in filename or '\\' in filename:
                    raise ValidationError(f"Invalid filename: {filename}")
        
        serializer = self.get_serializer(instance, data=validated_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

class UserProfileView(BaseProfileView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsEmployeeOrEmployer]
    
    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class CompanyProfileView(BaseProfileView):
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated, IsCompany]
    
    def get_object(self):
        profile, _ = CompanyProfile.objects.get_or_create(user=self.request.user)
        return profile
class PublicUserListAPIView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicUserSerializer
    queryset = User.objects.select_related('userprofile', 'companyprofile').annotate(followers_count=Count("followers")).order_by("-followers_count")

class PublicUserProfileAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicUserProfileSerializer
    queryset = User.objects.select_related('userprofile', 'companyprofile').prefetch_related(
        'followers', 'following', 'posts__images', 'jobs'
    ).annotate(
        followers_count=Count("followers"),
        following_count=Count("following")
    )
    lookup_field = 'id'
    
    def get_object(self):
        user_id = self.kwargs.get('id')
        # Validate ID is a positive integer
        try:
            user_id = int(user_id)
            if user_id <= 0:
                raise ValueError("Invalid ID")
        except (ValueError, TypeError):
            from django.http import Http404
            raise Http404("Invalid user ID")
        
        try:
            return super().get_object()
        except Exception:
            from django.http import Http404
            raise Http404("User not found")