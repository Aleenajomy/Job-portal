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
    author_profile_image = serializers.SerializerMethodField()
    images = PostImageSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    liked_by_current_user = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author_id', 'author_name', 'author_role', 'author_profile_image', 'content', 'images', 'created_at', 'likes_count', 'comments_count', 'liked_by_current_user', 'is_following')
        read_only_fields = ('created_at', 'author_id', 'author_name', 'author_role', 'author_profile_image', 'images', 'likes_count', 'comments_count')

    def get_author_name(self, obj):
        # For Company users, use full_name or company_name, otherwise use username/email
        if obj.author.job_role == 'Company':
            try:
                if hasattr(obj.author, 'companyprofile'):
                    return obj.author.companyprofile.company_name or f"{obj.author.first_name} {obj.author.last_name}".strip()
                return f"{obj.author.first_name} {obj.author.last_name}".strip()
            except:
                pass
        return obj.author.username or obj.author.email or f"User {obj.author.id}"
    
    def get_author_profile_image(self, obj):
        request = self.context.get('request')
        try:
            if obj.author.job_role == 'Company':
                # For company users, check both CompanyProfile and UserProfile
                if hasattr(obj.author, 'companyprofile'):
                    profile = obj.author.companyprofile
                    if profile.company_logo:
                        url = profile.company_logo.url
                        return request.build_absolute_uri(url) if request else url
                
                # Fallback to UserProfile for companies that uploaded to profile_image
                if hasattr(obj.author, 'userprofile'):
                    profile = obj.author.userprofile
                    if profile.profile_image:
                        url = profile.profile_image.url
                        return request.build_absolute_uri(url) if request else url
            else:
                if hasattr(obj.author, 'userprofile'):
                    profile = obj.author.userprofile
                    if profile.profile_image:
                        url = profile.profile_image.url
                        return request.build_absolute_uri(url) if request else url
        except Exception as e:
            print(f"Error getting profile image: {e}")
        return None

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