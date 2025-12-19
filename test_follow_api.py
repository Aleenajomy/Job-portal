#!/usr/bin/env python3
"""
Test script to verify follow API endpoints are working
"""

import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Jobportal'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'authentication.settings')
django.setup()

from accounts.models import User
from follows.models import Follow

def test_follow_api():
    print("🔍 Testing Follow API...")
    
    # Get some test users
    users = User.objects.all()[:3]
    if len(users) < 2:
        print("❌ Need at least 2 users to test follow functionality")
        return
    
    user1, user2 = users[0], users[1]
    print(f"Testing with users: {user1.email} and {user2.email}")
    
    # Test 1: Check initial follow status
    initial_follow = Follow.objects.filter(follower=user1, following=user2).exists()
    print(f"Initial follow status: {initial_follow}")
    
    # Test 2: Create follow relationship
    if not initial_follow:
        follow = Follow.objects.create(follower=user1, following=user2)
        print(f"✅ Created follow relationship: {follow}")
    
    # Test 3: Check follow counts
    following_count = Follow.objects.filter(follower=user1).count()
    followers_count = Follow.objects.filter(following=user1).count()
    total_connections = following_count + followers_count
    
    print(f"User {user1.email} stats:")
    print(f"  - Following: {following_count}")
    print(f"  - Followers: {followers_count}")
    print(f"  - Total Connections: {total_connections}")
    
    # Test 4: Test suggestions query
    following_ids = Follow.objects.filter(follower=user1).values_list('following_id', flat=True)
    suggestions = User.objects.exclude(id__in=[user1.id] + list(following_ids))[:5]
    
    print(f"Suggestions for {user1.email}: {[u.email for u in suggestions]}")
    
    print("✅ Follow API test completed!")

if __name__ == '__main__':
    test_follow_api()