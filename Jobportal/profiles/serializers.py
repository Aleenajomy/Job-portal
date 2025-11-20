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
from accounts.models import User
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Profile
        fields = ('image', 'skills', 'experience_years', 'address', 'bio')


class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'job_role', 'profile', 'is_verified')
        read_only_fields = ('id', 'email', 'is_verified')
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if profile_data is not None:
            Profile.objects.update_or_create(user=instance, defaults=profile_data)
        return instance


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'job_role')