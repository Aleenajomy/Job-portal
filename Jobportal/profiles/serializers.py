from rest_framework import serializers
from .models import UserProfile, CompanyProfile
from accounts.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', read_only=True)
    job_role = serializers.CharField(source='user.job_role', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ["id",'email', 'full_name', 'job_role', 'profile_image', 'phone', 'location', 'bio', 'skills', 'experience_years', 'company_name', 'followers_count', 'following_count']
    
    def get_full_name(self, obj):
        try:
            return obj.full_name if hasattr(obj, 'full_name') else ""
        except AttributeError:
            return ""
    
    def get_followers_count(self, obj):
        # Performance: Use prefetch_related('user__followers') in view for multiple objects
        try:
            return obj.user.followers.count()
        except AttributeError:
            return 0

    def get_following_count(self, obj):
        # Performance: Use prefetch_related('user__following') in view for multiple objects
        try:
            return obj.user.following.count()
        except AttributeError:
            return 0
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CompanyProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    job_role = serializers.CharField(source='user.job_role', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyProfile
        fields = ["id",'email', 'job_role', 'company_logo', 'company_name', 'company_phone', 'company_website', 'company_address', 'company_description', 'followers_count', 'following_count']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get('company_name'):
            data['company_name'] = f"{instance.user.first_name} {instance.user.last_name}".strip()
        return data
    
    def get_followers_count(self, obj):
        # Performance: Use prefetch_related('user__followers') in view for multiple objects
        try:
            return obj.user.followers.count()
        except AttributeError:
            return 0

    def get_following_count(self, obj):
        # Performance: Use prefetch_related('user__following') in view for multiple objects
        try:
            return obj.user.following.count()
        except AttributeError:
            return 0
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
class PublicUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='job_role')
    photo = serializers.SerializerMethodField()
    followers = serializers.IntegerField(source='followers_count', read_only=True)
    bio = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    recent_posts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id","full_name", "role", "photo", "followers", "bio", "location", "posts_count", "recent_posts")
        read_only_fields = fields

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_photo(self, obj):
        try:
            if obj.job_role == 'Company':
                return obj.companyprofile.company_logo.url if obj.companyprofile.company_logo else None
            else:
                return obj.userprofile.profile_image.url if obj.userprofile.profile_image else None
        except:
            return None
    
    def get_bio(self, obj):
        try:
            if obj.job_role == 'Company':
                return obj.companyprofile.company_description
            else:
                return obj.userprofile.bio
        except:
            return None
    
    def get_location(self, obj):
        try:
            if obj.job_role == 'Company':
                return obj.companyprofile.company_address
            else:
                return obj.userprofile.location
        except:
            return None
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def get_recent_posts(self, obj):
        posts = obj.posts.all()[:3]
        return [{
            "content": post.content[:50] + "..." if len(post.content) > 50 else post.content,
            "images": post.images.count()
        } for post in posts]

class PublicUserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='job_role')
    photo = serializers.SerializerMethodField()
    followers = serializers.IntegerField(source='followers_count', read_only=True)
    bio = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    recent_posts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("full_name", "role", "photo", "followers", "bio", "location", "posts_count", "recent_posts")
        read_only_fields = fields

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_photo(self, obj):
        try:
            if obj.job_role == 'Company':
                return obj.companyprofile.company_logo.url if obj.companyprofile.company_logo else None
            else:
                return obj.userprofile.profile_image.url if obj.userprofile.profile_image else None
        except:
            return None
    
    def get_bio(self, obj):
        try:
            if obj.job_role == 'Company':
                return obj.companyprofile.company_description
            else:
                return obj.userprofile.bio
        except:
            return None
    
    def get_location(self, obj):
        try:
            if obj.job_role == 'Company':
                return obj.companyprofile.company_address
            else:
                return obj.userprofile.location
        except:
            return None
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def get_recent_posts(self, obj):
        posts = obj.posts.all()[:3]
        return [{
            "content": post.content[:50] + "..." if len(post.content) > 50 else post.content,
            "images": post.images.count()
        } for post in posts]