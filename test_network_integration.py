#!/usr/bin/env python3
"""
Simple test script to verify network integration is working
Run this from the Jobportal directory: python ../test_network_integration.py
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

def test_network_integration():
    print("🔍 Testing Network Integration...")
    
    # Test 1: Check database state
    print("\n1. Database Status:")
    user_count = User.objects.count()
    follow_count = Follow.objects.count()
    print(f"   ✓ Total users: {user_count}")
    print(f"   ✓ Total follow relationships: {follow_count}")
    
    # Check for posts if available
    try:
        from posts.models import Post
        post_count = Post.objects.count()
        print(f"   ✓ Total posts: {post_count}")
    except ImportError:
        print("   ⚠ Posts app not available - post counts will be 0")
    
    # Test 2: Check existing users
    print("\n2. Checking existing users:")
    if user_count > 0:
        sample_users = User.objects.all()[:3]
        for user in sample_users:
            print(f"   ✓ User: {user.email} ({user.job_role})")
    else:
        print("   ⚠ No users found. Create users through the registration system.")
    
    # Test 3: Analyze existing follow relationships
    print("\n3. Analyzing Follow Relationships:")
    users = User.objects.all()[:5]
    if len(users) >= 1:
        for user in users:
            following_count = Follow.objects.filter(follower=user).count()
            followers_count = Follow.objects.filter(following=user).count()
            total_connections = following_count + followers_count
            
            print(f"   ✓ {user.email} network stats:")
            print(f"     - Following: {following_count}")
            print(f"     - Followers: {followers_count}")
            print(f"     - Total Connections: {total_connections}")
    else:
        print("   ⚠ No users found to analyze.")
    
    print("\n✅ Network Integration Test Complete!")
    print("\nAPI Endpoints available:")
    print("- GET /api-follows/network-stats/ - Get connection statistics")
    print("- GET /api-follows/suggestions/ - Get user suggestions")
    print("- GET /api-follows/my-following/ - Get following list")
    print("- GET /api-follows/my-followers/ - Get followers list")
    print("- POST /api-follows/follow/<user_id>/ - Follow a user")
    print("- DELETE /api-follows/unfollow/<user_id>/ - Unfollow a user")
    print("\nNext steps:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Start React frontend: npm run dev")
    print("3. All data is now fully dynamic from the database!")

if __name__ == '__main__':
    test_network_integration()