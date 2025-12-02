from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Post, PostLike

User = get_user_model()

class PostLikeTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='user1@test.com',
            first_name='User1',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='user2@test.com',
            first_name='User2',
            password='testpass123'
        )
        self.post = Post.objects.create(
            author=self.user1,
            content='Test post content'
        )

    def test_like_post(self):
        """Test liking a post"""
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api-post/posts/{self.post.id}/like/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['liked'])
        self.assertEqual(response.data['likes_count'], 1)
        
        # Verify in database
        self.assertTrue(PostLike.objects.filter(user=self.user2, post=self.post).exists())
        self.post.refresh_from_db()
        self.assertEqual(self.post.likes_count, 1)

    def test_unlike_post(self):
        """Test unliking a post"""
        # First like the post
        PostLike.objects.create(user=self.user2, post=self.post)
        self.post.likes_count = 1
        self.post.save()
        
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api-post/posts/{self.post.id}/unlike/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['unliked'])
        self.assertEqual(response.data['likes_count'], 0)
        
        # Verify in database
        self.assertFalse(PostLike.objects.filter(user=self.user2, post=self.post).exists())

    def test_idempotent_like(self):
        """Test that liking twice doesn't create duplicate likes"""
        self.client.force_authenticate(user=self.user2)
        
        # Like first time
        response1 = self.client.post(f'/api-post/posts/{self.post.id}/like/')
        self.assertTrue(response1.data['liked'])
        
        # Like second time (should be idempotent)
        response2 = self.client.post(f'/api-post/posts/{self.post.id}/like/')
        self.assertFalse(response2.data['liked'])  # Already liked
        
        # Should still have only 1 like
        self.assertEqual(PostLike.objects.filter(post=self.post).count(), 1)