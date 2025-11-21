# from rest_framework import serializers
# from .models import Profile, Skill
# from accounts.models import User

# class UserSerializer(serializers.ModelSerializer):
#     job_role_display = serializers.CharField(source='get_job_role_display', read_only=True)
    
#     class Meta:
#         model = User
#         fields = ['id', 'first_name', 'last_name', 'email', 'job_role', 'job_role_display']
#         read_only_fields = ['id']

# class SkillSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Skill
#         fields = ['id', 'name']
#         read_only_fields = ['id']
        
# class ProfileSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)
#     skills = serializers.StringRelatedField(many=True, read_only=True)
#     skill_names = serializers.ListField(
#         child=serializers.CharField(max_length=100),
#         write_only=True,
#         required=False
#     )
    
#     class Meta:
#         model = Profile
#         fields = ['id', 'user', 'phone', 'address', 'skills', 'skill_names', 'experience_years', 'profile_img']
    
#     def update(self, instance, validated_data):
#         skill_names = validated_data.pop('skill_names', None)
        
#         # Update other fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
        
#         # Update skills if provided
#         if skill_names is not None:
#             instance.skills.clear()
#             for skill_name in skill_names:
#                 skill, _ = Skill.objects.get_or_create(name=skill_name)
#                 instance.skills.add(skill)
        
#         return instance

from rest_framework import serializers
from .models import UserProfile, CompanyProfile

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = ['full_name', 'profile_image', 'phone', 'location', 'bio', 'skills', 'experience_years', 'company_name']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = ['company_logo', 'company_name', 'company_email', 'company_phone', 'company_website', 'company_address', 'company_description']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)