from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action

from .models import Post, PostImage
from .serializers import PostSerializer

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
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit/delete your own posts")
        return obj

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_posts(self, request):
        queryset = Post.objects.filter(author=request.user).prefetch_related('images')
        serializer = self.get_serializer(queryset, many=True)
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