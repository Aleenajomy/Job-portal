from rest_framework import serializers
from .models import UserProfile, CompanyProfile

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', read_only=True)
    job_role = serializers.CharField(source='user.job_role', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['email', 'full_name', 'job_role', 'profile_image', 'phone', 'location', 'bio', 'skills', 'experience_years', 'company_name', 'followers_count', 'following_count']
    
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
        fields = ['email', 'job_role', 'company_logo', 'company_name', 'company_phone', 'company_website', 'company_address', 'company_description', 'followers_count', 'following_count']
    
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