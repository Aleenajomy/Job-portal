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
        

        
        print(f"Serializer - Follower: {follower.id}, Following: {following.id}")
        result = can_follow(follower, following)
        print(f"can_follow returned: {result}")
        
        if result == "self":
            print("Raising self-follow error")
            raise serializers.ValidationError("You cannot follow yourself.")
        elif not result:
            print("Raising role restriction error")
            raise serializers.ValidationError("You cannot follow this user based on role restrictions.")
        
        print("Validation passed")
        return data