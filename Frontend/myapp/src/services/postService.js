import { apiService } from './apiService';

const API_BASE_URL = apiService.getPostsApiUrl();

export const postService = {
  // Get all posts
  getAllPosts: () => apiService.get(`${API_BASE_URL}/posts/`),

  // Get current user's posts only
  getUserPosts: () => apiService.get(`${API_BASE_URL}/posts/my_posts/`),

  // Create new post with images
  createPost: async (postData, images = []) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    images.forEach(image => formData.append('images', image));
    return apiService.postFormData(`${API_BASE_URL}/posts/`, formData);
  },

  // Update post
  updatePost: async (postId, postData, images = []) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    images.forEach(image => formData.append('images', image));
    return apiService.patchFormData(`${API_BASE_URL}/posts/${postId}/`, formData);
  },

  // Delete post
  deletePost: (postId) => apiService.delete(`${API_BASE_URL}/posts/${postId}/`),

  // Like post
  likePost: (postId) => apiService.post(`${API_BASE_URL}/posts/${postId}/like/`, {}),

  // Unlike post
  unlikePost: (postId) => apiService.post(`${API_BASE_URL}/posts/${postId}/unlike/`, {}),

  // Get comments for a post
  getComments: (postId) => apiService.get(`${API_BASE_URL}/posts/${postId}/comments/`),

  // Add comment to post
  addComment: (postId, commentText) => 
    apiService.post(`${API_BASE_URL}/posts/${postId}/comments/add/`, { text: commentText }),

  // Update comment
  updateComment: (commentId, commentText) => 
    apiService.patch(`${API_BASE_URL}/comments/${commentId}/`, { text: commentText }),

  // Delete comment
  deleteComment: (commentId) => apiService.delete(`${API_BASE_URL}/comments/${commentId}/`),
};