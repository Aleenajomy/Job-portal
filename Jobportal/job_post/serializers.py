from rest_framework import serializers
from .models import JobPost

class JobPostListSerializer(serializers.ModelSerializer):
    publisher_name = serializers.SerializerMethodField()
    publisher_email = serializers.CharField(source="publisher.email", read_only=True)
    publisher_role = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = ("id", "title", "publisher_name", "publisher_email", "publisher_role", "job_type", "created_at")

    def get_publisher_name(self, obj):
        return f"{obj.publisher.first_name} {obj.publisher.last_name}"
    
    def get_publisher_role(self, obj):
        return obj.publisher_role or getattr(obj.publisher, "job_role", None)

class JobPostDetailSerializer(serializers.ModelSerializer):
    publisher_name = serializers.SerializerMethodField()
    publisher_email = serializers.CharField(source="publisher.email", read_only=True)
    publisher_role = serializers.SerializerMethodField()
    publisher_phone = serializers.CharField(source="publisher.profile.phone", read_only=True)
    publisher_profile_img = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = (
            "id", "title", "description", "requirements", "company_name", "location", "salary", "job_type",
            "publisher_name", "publisher_email", "publisher_role", "publisher_phone", "publisher_profile_img",
            "created_at", "updated_at", "is_active", "is_applied"
        )
        read_only_fields = ("publisher_name", "publisher_email", "publisher_role", "created_at", "updated_at")

    def get_publisher_name(self, obj):
        return f"{obj.publisher.first_name} {obj.publisher.last_name}"
    
    def get_publisher_role(self, obj):
        return obj.publisher_role or getattr(obj.publisher, "job_role", None)
    
    def get_publisher_profile_img(self, obj):
        try:
            if obj.publisher.profile.image:
                return obj.publisher.profile.image.url
        except:
            pass
        return None
    
