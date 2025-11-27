from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from accounts.models import User
from .models import Follow
from .serializers import FollowSerializer

class FollowUserView(generics.CreateAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, user_id=None):
        user_id = user_id or self.kwargs.get('user_id')
        print(f"View - user_id: {user_id}")
        following_user = get_object_or_404(User, id=user_id)
        
        print(f"View - Request user ID: {request.user.id}")
        print(f"View - Following user ID: {following_user.id}")
        print(f"View - Are they equal? {request.user.id == following_user.id}")
        
        # Check if trying to follow self
        if request.user.id == following_user.id:
            print("View - Returning self-follow error")
            return Response({'message': 'You cannot follow yourself'}, status=400)
        
        if Follow.objects.filter(follower=request.user, following=following_user).exists():
            return Response({'message': 'Already following this user'}, status=400)
        
        serializer = self.get_serializer(data={'following': following_user.id})
        if serializer.is_valid():
            serializer.save(follower=request.user)
            print("View - Returning success")
            return Response({'message': 'Successfully followed user'}, status=201)
        return Response(serializer.errors, status=400)

class UnfollowUserView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id=None):
        user_id = user_id or self.kwargs.get('user_id')
        following_user = get_object_or_404(User, id=user_id)
        follow = Follow.objects.filter(follower=request.user, following=following_user).first()
        
        if not follow:
            return Response({'message': 'Not following this user'}, status=400)
        
        follow.delete()
        return Response({'message': 'Successfully unfollowed user'}, status=200)

class MyFollowingView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following = Follow.objects.filter(follower=request.user).select_related('following')
        users = []
        for f in following:
            user_data = {'id': f.following.id, 'email': f.following.email, 'role': f.following.job_role}
            if f.following.job_role == 'Company':
                try:
                    user_data['name'] = f.following.companyprofile.company_name
                except:
                    user_data['name'] = f'{f.following.first_name} {f.following.last_name}'.strip()
            else:
                user_data['name'] = f'{f.following.first_name} {f.following.last_name}'.strip()
            users.append(user_data)
        return Response({'following': users, 'count': len(users)})

class MyFollowersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        followers = Follow.objects.filter(following=request.user).select_related('follower')
        users = []
        for f in followers:
            user_data = {'id': f.follower.id, 'email': f.follower.email, 'role': f.follower.job_role}
            if f.follower.job_role == 'Company':
                try:
                    user_data['name'] = f.follower.companyprofile.company_name
                except:
                    user_data['name'] = f'{f.follower.first_name} {f.follower.last_name}'.strip()
            else:
                user_data['name'] = f'{f.follower.first_name} {f.follower.last_name}'.strip()
            users.append(user_data)
        return Response({'followers': users, 'count': len(users)})