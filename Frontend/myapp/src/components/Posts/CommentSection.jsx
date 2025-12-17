import { useState, useEffect } from 'react';
import { postService } from '../../services/postService';
import { STORAGE_KEYS } from '../../constants/index.js';
import { AiOutlineSend, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { MdMoreVert } from 'react-icons/md';
import './CommentSection.css';

export default function CommentSection({ postId, commentsCount, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showCommentMenu, setShowCommentMenu] = useState(null);
  const currentUser = localStorage.getItem(STORAGE_KEYS.USER_NAME) || localStorage.getItem(STORAGE_KEYS.USER_EMAIL);

  const loadComments = async () => {
    if (!showComments) return;
    
    setLoading(true);
    try {
      const commentsData = await postService.getComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [showComments, postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await postService.addComment(postId, newComment);
      setNewComment('');
      loadComments();
      onCommentCountChange(commentsCount + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await postService.updateComment(commentId, editText);
      setEditingComment(null);
      setEditText('');
      loadComments();
      setShowCommentMenu(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(commentId);
      loadComments();
      onCommentCountChange(commentsCount - 1);
      setShowCommentMenu(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
    setShowCommentMenu(null);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const isCommentOwner = (comment) => {
    return comment.user === currentUser;
  };

  return (
    <div className="comment-section">
      <button 
        className="toggle-comments-btn"
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? 'Hide' : 'View'} Comments ({commentsCount})
      </button>

      {showComments && (
        <div className="comments-container">
          <form onSubmit={handleAddComment} className="add-comment-form">
            <div className="comment-input-container">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="comment-input"
              />
              <button 
                type="submit" 
                className="send-comment-btn"
                disabled={!newComment.trim()}
              >
                <AiOutlineSend size={16} />
              </button>
            </div>
          </form>

          {loading ? (
            <div className="comments-loading">Loading comments...</div>
          ) : (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="comment-avatar">
                        {comment.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="comment-username">{comment.user}</span>
                      <span className="comment-time">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {isCommentOwner(comment) && (
                      <div className="comment-menu">
                        <button 
                          className="comment-menu-btn"
                          onClick={() => setShowCommentMenu(
                            showCommentMenu === comment.id ? null : comment.id
                          )}
                        >
                          <MdMoreVert size={16} />
                        </button>
                        
                        {showCommentMenu === comment.id && (
                          <div className="comment-menu-dropdown">
                            <button 
                              className="comment-menu-item"
                              onClick={() => startEdit(comment)}
                            >
                              <AiOutlineEdit size={14} />
                              Edit
                            </button>
                            <button 
                              className="comment-menu-item delete"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <AiOutlineDelete size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="comment-content">
                    {editingComment === comment.id ? (
                      <div className="edit-comment-form">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="edit-comment-input"
                          autoFocus
                        />
                        <div className="edit-comment-actions">
                          <button 
                            className="save-edit-btn"
                            onClick={() => handleEditComment(comment.id)}
                          >
                            Save
                          </button>
                          <button 
                            className="cancel-edit-btn"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-text">{comment.text}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="no-comments">No comments yet. Be the first to comment!</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}