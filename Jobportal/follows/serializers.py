from rest_framework import serializers
from .models import Follow
from .services import can_follow

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['follower', 'created_at']

    def validate(self, data):
        follower = self.context['request'].user
        following = data['following']
        
        result = can_follow(follower, following)
        
        if result == "self":
            raise serializers.ValidationError("You cannot follow yourself.")
        elif not result:
            raise serializers.ValidationError("You cannot follow this user based on role restrictions.")
        
        return data