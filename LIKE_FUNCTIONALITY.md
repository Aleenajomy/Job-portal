# Post Like/Unlike Functionality

## Overview
This implementation provides like/unlike functionality for posts with the following features:
- **Idempotent operations**: Multiple like/unlike calls are safe
- **Performance optimized**: Uses denormalized `likes_count` field with atomic F() updates
- **Race condition safe**: Uses database transactions
- **Duplicate prevention**: `unique_together` constraint prevents duplicate likes

## API Endpoints

### Like a Post
```
POST /api-post/posts/{post_id}/like/
```
**Authentication**: Required  
**Response**:
```json
{
    "liked": true,
    "likes_count": 5
}
```

### Unlike a Post  
```
POST /api-post/posts/{post_id}/unlike/
```
**Authentication**: Required  
**Response**:
```json
{
    "unliked": true,
    "likes_count": 4
}
```

### Get Posts (with like info)
```
GET /api-post/posts/
```
**Response includes**:
```json
{
    "id": 1,
    "author_name": "user@example.com",
    "content": "Post content",
    "likes_count": 5,
    "liked_by_current_user": true,
    "created_at": "2024-01-01T12:00:00Z"
}
```

## Database Models

### PostLike Model
- `user`: ForeignKey to User
- `post`: ForeignKey to Post  
- `created_at`: Timestamp
- **Constraint**: `unique_together = ("user", "post")` prevents duplicates

### Post Model (Updated)
- Added `likes_count`: PositiveIntegerField for performance

## Usage Examples

### Frontend JavaScript
```javascript
// Like a post
const likePost = async (postId) => {
    const response = await fetch(`/api-post/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(`Post ${data.liked ? 'liked' : 'already liked'}. Total likes: ${data.likes_count}`);
};

// Unlike a post
const unlikePost = async (postId) => {
    const response = await fetch(`/api-post/posts/${postId}/unlike/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(`Post ${data.unliked ? 'unliked' : 'was not liked'}. Total likes: ${data.likes_count}`);
};
```

## Key Features

1. **Idempotent**: Calling like/unlike multiple times is safe
2. **Atomic**: Uses database transactions to prevent race conditions  
3. **Performant**: Denormalized likes_count avoids N+1 queries
4. **Secure**: Only authenticated users can like/unlike posts
5. **Consistent**: F() expressions ensure atomic counter updates

## Testing
Run tests with:
```bash
python manage.py test posts.test_likes
```