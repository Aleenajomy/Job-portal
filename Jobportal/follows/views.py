from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from accounts.models import User
from .models import Follow
from .serializers import FollowSerializer

def get_user_display_data(user):
    """Helper function to get user display name and company"""
    user_data = {
        'name': f'{user.first_name} {user.last_name}'.strip() or user.email.split('@')[0],
        'company': user.job_role
    }
    
    if user.job_role == 'Company':
        try:
            if hasattr(user, 'companyprofile') and user.companyprofile.company_name:
                user_data['name'] = user.companyprofile.company_name
                user_data['company'] = user.companyprofile.company_name
        except:
            pass
    elif user.job_role == 'Employer':
        try:
            if hasattr(user, 'employerprofile') and user.employerprofile.company_name:
                user_data['company'] = user.employerprofile.company_name
        except:
            pass
    elif user.job_role == 'Employee':
        try:
            if hasattr(user, 'employeeprofile') and user.employeeprofile.current_company:
                user_data['company'] = user.employeeprofile.current_company
        except:
            pass
    
    return user_data

class FollowUserView(generics.CreateAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, user_id=None):
        user_id = user_id or self.kwargs.get('user_id')
        following_user = get_object_or_404(User, id=user_id)
        
        if request.user.id == following_user.id:
            return Response({'message': 'You cannot follow yourself'}, status=400)
        
        if Follow.objects.filter(follower=request.user, following=following_user).exists():
            # Return success with current stats if already following
            following_count = Follow.objects.filter(follower=request.user).count()
            followers_count = Follow.objects.filter(following=request.user).count()
            return Response({
                'message': 'Already following this user',
                'stats': {
                    'following_count': following_count,
                    'followers_count': followers_count,
                    'total_connections': following_count + followers_count
                }
            }, status=200)
        
        serializer = self.get_serializer(data={'following': following_user.id})
        if serializer.is_valid():
            serializer.save(follower=request.user)
            
            following_count = Follow.objects.filter(follower=request.user).count()
            followers_count = Follow.objects.filter(following=request.user).count()
            
            return Response({
                'message': 'Successfully followed user',
                'stats': {
                    'following_count': following_count,
                    'followers_count': followers_count,
                    'total_connections': following_count + followers_count
                }
            }, status=201)
        return Response(serializer.errors, status=400)

class UnfollowUserView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id=None):
        user_id = user_id or self.kwargs.get('user_id')
        following_user = get_object_or_404(User, id=user_id)
        follow = Follow.objects.filter(follower=request.user, following=following_user).first()
        
        if not follow:
            # Return success with current stats if not following
            following_count = Follow.objects.filter(follower=request.user).count()
            followers_count = Follow.objects.filter(following=request.user).count()
            return Response({
                'message': 'Not following this user',
                'stats': {
                    'following_count': following_count,
                    'followers_count': followers_count,
                    'total_connections': following_count + followers_count
                }
            }, status=200)
        
        follow.delete()
        
        following_count = Follow.objects.filter(follower=request.user).count()
        followers_count = Follow.objects.filter(following=request.user).count()
        
        return Response({
            'message': 'Successfully unfollowed user',
            'stats': {
                'following_count': following_count,
                'followers_count': followers_count,
                'total_connections': following_count + followers_count
            }
        }, status=200)

class MyFollowingView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following = Follow.objects.filter(follower=request.user).select_related('following')
        users = []
        for f in following:
            user = f.following
            user_data = {
                'id': user.id,
                'email': user.email,
                'role': user.job_role,
                'followers_count': Follow.objects.filter(following=user).count(),
                'following_count': Follow.objects.filter(follower=user).count(),
            }
            
            user_data['total_connections'] = user_data['followers_count'] + user_data['following_count']
            
            try:
                from posts.models import Post
                user_data['posts_count'] = Post.objects.filter(author=user).count()
            except ImportError:
                user_data['posts_count'] = 0
            
            display_data = get_user_display_data(user)
            user_data.update(display_data)
            users.append(user_data)
        return Response({'following': users, 'count': len(users)})

class MyFollowersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        followers = Follow.objects.filter(following=request.user).select_related('follower')
        users = []
        for f in followers:
            user = f.follower
            user_data = {
                'id': user.id,
                'email': user.email,
                'role': user.job_role,
                'followers_count': Follow.objects.filter(following=user).count(),
                'following_count': Follow.objects.filter(follower=user).count(),
            }
            
            user_data['total_connections'] = user_data['followers_count'] + user_data['following_count']
            
            try:
                from posts.models import Post
                user_data['posts_count'] = Post.objects.filter(author=user).count()
            except ImportError:
                user_data['posts_count'] = 0
            
            display_data = get_user_display_data(user)
            user_data.update(display_data)
            users.append(user_data)
        return Response({'followers': users, 'count': len(users)})

class NetworkStatsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_count = Follow.objects.filter(follower=request.user).count()
        followers_count = Follow.objects.filter(following=request.user).count()
        total_connections = following_count + followers_count
        
        return Response({
            'following_count': following_count,
            'followers_count': followers_count,
            'total_connections': total_connections
        })

class UserSuggestionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        suggestions = User.objects.exclude(
            Q(id=request.user.id) | Q(id__in=following_ids)
        ).annotate(
            followers_count=Count('followers'),
            following_count=Count('following')
        )[:10]
        
        users = []
        for user in suggestions:
            is_following = Follow.objects.filter(follower=request.user, following=user).exists()
            
            user_data = {
                'id': user.id,
                'email': user.email,
                'role': user.job_role,
                'followers_count': user.followers_count,
                'following_count': user.following_count,
                'total_connections': user.followers_count + user.following_count,
                'isFollowing': is_following
            }
            
            try:
                from posts.models import Post
                user_data['posts_count'] = Post.objects.filter(author=user).count()
            except ImportError:
                user_data['posts_count'] = 0
            
            display_data = get_user_display_data(user)
            user_data.update(display_data)
            users.append(user_data)
        
        return Response({'suggestions': users, 'count': len(users)})