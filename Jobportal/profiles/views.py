from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile, CompanyProfile
from .serializers import UserProfileSerializer, CompanyProfileSerializer
from .permissions import IsCompany, IsEmployeeOrEmployer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsEmployeeOrEmployer]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            if 'profile_image' in request.data:
                return Response({'message': 'Profile image uploaded successfully'}, status=200)
            return Response({'message': 'Profile updated successfully'}, status=200)
        except Exception as e:
            return Response({'error': 'Failed to upload image'}, status=400)
    
    def partial_update(self, request, *args, **kwargs):
        try:
            response = super().partial_update(request, *args, **kwargs)
            if 'profile_image' in request.data:
                return Response({'message': 'Profile image uploaded successfully'}, status=200)
            return Response({'message': 'Profile updated successfully'}, status=200)
        except Exception as e:
            return Response({'error': 'Failed to upload image'}, status=400)

class CompanyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated, IsCompany]
    
    def get_object(self):
        profile, created = CompanyProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            if 'company_logo' in request.data:
                return Response({'message': 'Company logo uploaded successfully'}, status=200)
            return Response({'message': 'Company profile updated successfully'}, status=200)
        except Exception as e:
            return Response({'error': 'Failed to upload company logo'}, status=400)
    
    def partial_update(self, request, *args, **kwargs):
        try:
            response = super().partial_update(request, *args, **kwargs)
            if 'company_logo' in request.data:
                return Response({'message': 'Company logo uploaded successfully'}, status=200)
            return Response({'message': 'Company profile updated successfully'}, status=200)
        except Exception as e:
            return Response({'error': 'Failed to upload company logo'}, status=400)