from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import Profile

class UserProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=200)

class UserProfileUpdateAPI(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully'}, status=200)
        return Response({'errors': serializer.errors}, status=400)