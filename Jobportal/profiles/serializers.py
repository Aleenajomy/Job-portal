
from rest_framework import serializers
from .models import UserProfile, CompanyProfile

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    email = serializers.CharField(source='user.email', read_only=True)
    job_role = serializers.CharField(source='user.job_role', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['email', 'full_name', 'job_role', 'profile_image', 'phone', 'location', 'bio', 'skills', 'experience_years', 'company_name']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CompanyProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    job_role = serializers.CharField(source='user.job_role', read_only=True)
    
    class Meta:
        model = CompanyProfile
        fields = ['email', 'job_role', 'company_logo', 'company_name', 'company_phone', 'company_website', 'company_address', 'company_description']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)