from rest_framework import serializers
from .models import Post, PostImage, Comment

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ('id', 'image', 'order')
        read_only_fields = ('id',)

class PostSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_name = serializers.SerializerMethodField()
    author_role = serializers.CharField(source='author.job_role', read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    liked_by_current_user = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author_id', 'author_name', 'author_role', 'content', 'images', 'created_at', 'likes_count', 'comments_count', 'liked_by_current_user', 'is_following')
        read_only_fields = ('created_at', 'author_id', 'author_name', 'author_role', 'images', 'likes_count', 'comments_count')

    def get_author_name(self, obj):
        return obj.author.username or obj.author.email or f"User {obj.author.id}"

    def get_liked_by_current_user(self, obj):
        user = self.context.get("request").user
        if user.is_anonymous:
            return False
        return obj.likes.filter(user=user).exists()
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return False
        
        try:
            from follows.models import Follow
            return Follow.objects.filter(follower=request.user, following=obj.author).exists()
        except ImportError:
            return False

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at', 'updated_at']