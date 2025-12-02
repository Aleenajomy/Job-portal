from rest_framework import serializers
from django.db.models import Count
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.html import escape
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password','confirm_password', 'job_role']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate_job_role(self, value):
        valid_choices = [choice[0] for choice in User.JOB_ROLE_CHOICES]
        if value not in valid_choices:
            raise serializers.ValidationError(f"Invalid job role. Must be one of: {', '.join(valid_choices)}")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already exists")
        
        # Validate password strength
        try:
            validate_password(data['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        
        # Prevent path traversal in name fields
        for field in ['first_name', 'last_name']:
            if field in data and data[field]:
                if any(char in str(data[field]) for char in ['../', '.\\', '/', '\\']):
                    raise serializers.ValidationError(f"{field} contains invalid characters")
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        try:
            user = User(**validated_data)
            user.set_password(validated_data['password'])
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")        
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = User.objects.filter(email=data['email']).first()
        if not user:
            raise serializers.ValidationError("User not found")
        if not user.check_password(data['password']):
            raise serializers.ValidationError("Incorrect password")
        return data

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value
    def create(self, validated_data):
        try:
            user = User.objects.get(email=validated_data['email'])
            user.generate_otp()
            user.save()
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        except Exception as e:
            raise serializers.ValidationError(f"Failed to generate OTP: {str(e)}")
class ForgotPasswordOTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    
    def validate(self, data):
        user = User.objects.filter(email=data['email']).first()
        if not user:
            raise serializers.ValidationError("User not found")
        if user.otp != data['otp']:
            raise serializers.ValidationError("Invalid OTP")
        return data

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate password strength
        try:
            validate_password(data['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': e.messages})
        
        return data

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    
    def validate(self, data):
        user = User.objects.filter(email=data['email']).first()
        if not user:
            raise serializers.ValidationError("User not found")
        if user.otp != data['otp']:
            raise serializers.ValidationError("Invalid OTP")
        return data

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    resended_otp = serializers.CharField(max_length=6, read_only=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value

class ChangePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate password strength
        try:
            validate_password(data['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': e.messages})
        
        return data

class PublicUserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    username = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "followers_count")
        read_only_fields = fields

    def get_username(self, obj):
        first = (obj.first_name or "").strip()
        last = (obj.last_name or "").strip()
        
        if first and last:
            return f"{first} {last}"
        elif first:
            return first
        elif last:
            return last
        
        return obj.username or ""

class PublicUserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    masked_email = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "masked_email", "job_role", "followers_count", "following_count", "profile")
        read_only_fields = fields

    def get_masked_email(self, obj):
        email = getattr(obj, "email", "") or ""
        if "@" not in email:
            return ""
        local, domain = email.split("@", 1)
        if len(local) <= 2:
            local_masked = escape(local[0]) + "***"
        else:
            local_masked = escape(local[:2]) + "***"
        return f"{local_masked}@{escape(domain)}"

    def get_profile(self, obj):
        if obj.job_role == 'COMPANY':
            try:
                from profiles.models import CompanyProfile
                profile = CompanyProfile.objects.get(user=obj)
                return {
                    "company_name": profile.company_name,
                    "company_description": profile.company_description,
                    "company_website": profile.company_website,
                    "company_address": profile.company_address
                }
            except CompanyProfile.DoesNotExist:
                return None
        else:
            try:
                from profiles.models import UserProfile
                profile = UserProfile.objects.get(user=obj)
                return {
                    "bio": profile.bio,
                    "location": profile.location,
                    "skills": profile.skills,
                    "experience_years": profile.experience_years
                }
            except UserProfile.DoesNotExist:
                return None

