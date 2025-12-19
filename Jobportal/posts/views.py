from django.db import transaction
from django.db.models import F
from rest_framework import viewsets, status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from .models import Post, PostImage, PostLike, Comment
from .serializers import PostSerializer, CommentSerializer
from .permissions import IsCommentOwner, IsPostOwnerOrCommentOwner

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.prefetch_related('images').all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self):
        obj = super().get_object()
        if self.action in ['update', 'partial_update', 'destroy'] and obj.author != self.request.user:
            # Allow admins/staff to delete any post
            if self.action == 'destroy' and self.request.user.is_staff:
                return obj
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit/delete your own posts")
        return obj

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_posts(self, request):
        queryset = Post.objects.filter(author=request.user).prefetch_related('images')
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save()
            
            # Handle multiple images after post creation
            images = request.FILES.getlist('images')
            for idx, image in enumerate(images):
                PostImage.objects.create(post=post, image=image, order=idx)
            
            return Response({
                'message': 'Post created successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        serializer = self.get_serializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Handle new images if provided
            images = request.FILES.getlist('images')
            if images:
                # Delete old images and add new ones
                post.images.all().delete()
                for idx, image in enumerate(images):
                    PostImage.objects.create(post=post, image=image, order=idx)
            
            return Response({'message': 'Post updated successfully'})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({'message': 'Post deleted successfully'})

    @action(detail=False, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, image_id=None):
        try:
            image = PostImage.objects.get(id=image_id, post__author=request.user)
            image.delete()
            return Response({'message': 'Image deleted successfully'})
        except PostImage.DoesNotExist:
            return Response({'message': 'Image not found'}, status=404)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Like a post (idempotent)"""
        post = self.get_object()
        user = request.user

        try:
            with transaction.atomic():
                obj, created = PostLike.objects.get_or_create(user=user, post=post)
                if created:
                    Post.objects.filter(pk=post.pk).update(likes_count=F("likes_count") + 1)
        except Exception:
            return Response({"detail": "Could not like post."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "liked": bool(created), 
            "likes_count": Post.objects.get(pk=post.pk).likes_count
        })

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def unlike(self, request, pk=None):
        """Unlike a post (idempotent)"""
        post = self.get_object()
        user = request.user

        try:
            with transaction.atomic():
                deleted, _ = PostLike.objects.filter(user=user, post=post).delete()
                if deleted:
                    Post.objects.filter(pk=post.pk).update(likes_count=F("likes_count") - 1)
        except Exception:
            return Response({"detail": "Could not unlike post."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "unliked": bool(deleted), 
            "likes_count": Post.objects.get(pk=post.pk).likes_count
        })

    @action(detail=True, methods=['delete'], url_path='comments/(?P<comment_id>[^/.]+)', permission_classes=[IsAuthenticated])
    def delete_comment(self, request, pk=None, comment_id=None):
        """Delete a comment on this post (only post owner can delete)"""
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'Only post owner or admin can delete comments'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            comment = Comment.objects.get(id=comment_id, post=post)
            if comment.user == request.user and not request.user.is_staff:
                return Response({'detail': 'Comment authors should use /comments/{id}/ endpoint'}, status=status.HTTP_400_BAD_REQUEST)
            comment.delete()
            Post.objects.filter(pk=post.pk).update(comments_count=F('comments_count') - 1)
            return Response({'message': 'Comment deleted successfully'})
        except Comment.DoesNotExist:
            return Response({'detail': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['post_id'])
        serializer.save(user=self.request.user, post=post)
        Post.objects.filter(pk=post.pk).update(comments_count=F('comments_count') + 1)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({'message': 'Comment added successfully'}, status=status.HTTP_201_CREATED)

class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs['post_id']).order_by('-created_at')

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsPostOwnerOrCommentOwner]

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({'message': 'Comment updated successfully'})

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        post = comment.post
        super().destroy(request, *args, **kwargs)
        Post.objects.filter(pk=post.pk).update(comments_count=F('comments_count') - 1)
        return Response({'message': 'Comment deleted successfully'})