from rest_framework import serializers
from .models import Post, PostImage

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ('id', 'image', 'order')
        read_only_fields = ('id',)

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.CharField(source='author.job_role', read_only=True)
    images = PostImageSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ('id', 'author_name', 'author_role', 'content', 'images', 'created_at')
        read_only_fields = ('created_at', 'author_name', 'author_role', 'images')

    def get_author_name(self, obj):
        return obj.author.username or obj.author.email or f"User {obj.author.id}"

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)