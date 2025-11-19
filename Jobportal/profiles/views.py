from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Profile, Skill
from accounts.models import User
from .serializers import ProfileSerializer
import jwt
from django.conf import settings

class BaseProfileView(APIView):
    def get_user_from_token(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded.get('user_id')
            return User.objects.get(id=user_id)
        except:
            return None

class MyProfileView(BaseProfileView):
    def get(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Invalid token'}, status=401)
        
        profile, _ = Profile.objects.get_or_create(user=user)
        return Response({'data': ProfileSerializer(profile).data})
    
    def put(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Invalid token'}, status=401)
        
        profile, _ = Profile.objects.get_or_create(user=user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data})
        return Response({'errors': serializer.errors}, status=400)
    
    def patch(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Invalid token'}, status=401)
        
        profile, _ = Profile.objects.get_or_create(user=user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data})
        return Response({'errors': serializer.errors}, status=400)

class SkillManagementView(BaseProfileView):
    def post(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Invalid token'}, status=401)
        
        profile, _ = Profile.objects.get_or_create(user=user)
        skill_name = request.data.get('skill_name')
        if not skill_name:
            return Response({'error': 'skill_name required'}, status=400)
        
        skill, _ = Skill.objects.get_or_create(name=skill_name)
        profile.skills.add(skill)
        return Response({'message': 'Skill added'})
    
