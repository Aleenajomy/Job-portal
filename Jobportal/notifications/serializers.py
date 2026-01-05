from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'sender_name', 
            'notification_type',
            'message',
            'object_id',
            'is_read',
            'created_at'
        ]