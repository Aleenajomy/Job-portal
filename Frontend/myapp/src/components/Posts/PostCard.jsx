import { AiOutlineLike, AiOutlineComment, AiFillLike } from "react-icons/ai";
import { MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { RiUserFollowLine } from "react-icons/ri";
import CommentSection from './CommentSection';

import { apiService } from '../../services/apiService';

const API_BASE_URL = apiService.getBaseUrl();

export default function PostCard({ 
  post, 
  isCurrentUserPost, 
  showPostMenu, 
  onMenuToggle, 
  onEdit, 
  onDelete, 
  onLike, 
  onImageClick, 
  onCommentCountChange, 
  formatTimestamp,
  showFollowButton = true
}) {
  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          <div className="post-avatar">
            {(post.author_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="post-details">
            <h4>{post.author_name || 'Unknown User'}</h4>
            <p>{isCurrentUserPost(post) ? 'You' : (post.author_role || 'User')}</p>
            <span>{formatTimestamp(post.created_at)}</span>
          </div>
        </div>
        {isCurrentUserPost(post) ? (
          <div className="post-menu">
            <button 
              className="menu-btn"
              onClick={() => onMenuToggle(post.id)}
            >
              <MdMoreVert size={20} />
            </button>
            {showPostMenu === post.id && (
              <div className="post-menu-dropdown">
                <button 
                  className="menu-item"
                  onClick={() => onEdit(post)}
                >
                  <MdEdit size={16} />
                  Edit
                </button>
                <button 
                  className="menu-item delete"
                  onClick={() => onDelete(post.id)}
                >
                  <MdDelete size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        ) : showFollowButton ? (
          <button className="follow-btn">
            <RiUserFollowLine size={16} />
            Follow
          </button>
        ) : null}
      </div>
      <div className="post-content">
        <p>{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.length === 1 ? (
              <img 
                src={post.images[0].image.replace('http://127.0.0.1:8000', 'http://localhost:8000')} 
                alt="Post" 
                className="single-image" 
                onClick={() => onImageClick(post.images, 0)}
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className={`image-grid grid-${Math.min(post.images.length, 4)}`}>
                {post.images.slice(0, 4).map((image, index) => {
                  const lastIndex = Math.min(post.images.length, 4) - 1;
                  const showBadge = index === lastIndex;
                  console.log('Image', index, 'lastIndex:', lastIndex, 'showBadge:', showBadge);
                  return (
                  <div key={index} className="image-container">
                    <img 
                      src={image.image.replace('http://127.0.0.1:8000', 'http://localhost:8000')} 
                      alt={`Post ${index + 1}`} 
                      onClick={() => onImageClick(post.images, index)}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                    {index === 3 && post.images.length > 4 && (
                      <div className="more-images-overlay" onClick={() => onImageClick(post.images, index)}>
                        +{post.images.length - 4}
                      </div>
                    )}
                    {index === Math.min(post.images.length, 4) - 1 && (
                      <div className="image-count-badge">
                        {Math.min(post.images.length, 4)}/{post.images.length}
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="post-actions">
        <button 
          className={`action-btn ${post.liked_by_current_user ? 'liked' : ''}`} 
          onClick={() => onLike(post.id, post.liked_by_current_user)}
        >
          {post.liked_by_current_user ? <AiFillLike size={16} /> : <AiOutlineLike size={16} />}
          Like ({post.likes_count})
        </button>
        <button className="action-btn">
          <AiOutlineComment size={16} />
          Comment ({post.comments_count})
        </button>
      </div>
      <CommentSection 
        postId={post.id}
        commentsCount={post.comments_count}
        onCommentCountChange={(newCount) => onCommentCountChange(post.id, newCount)}
      />
    </div>
  );
}