import os
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .models import UserProfile, CompanyProfile
from .serializers import UserProfileSerializer, CompanyProfileSerializer
from .permissions import IsCompany, IsEmployeeOrEmployer

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