// frontend/src/components/Comments.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './Comments.css';

const Comments = ({ characterId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    }
    fetchComments();
  }, [characterId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/character/${characterId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión para comentar');
      return;
    }

    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          characterId,
          content: newComment
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
        toast.success('Comentario publicado');
      } else {
        toast.error(data.message || 'Error al publicar comentario');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Error al publicar comentario');
    }
  };

  const handleSubmitReply = async (parentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión para responder');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('La respuesta no puede estar vacía');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          characterId,
          content: replyContent,
          parentId
        })
      });

      const data = await response.json();
      if (data.success) {
        setReplyContent('');
        setReplyTo(null);
        fetchComments();
        toast.success('Respuesta publicada');
      } else {
        toast.error(data.message || 'Error al publicar respuesta');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Error al publicar respuesta');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchComments();
        toast.success('Comentario eliminado');
      } else {
        toast.error(data.message || 'Error al eliminar comentario');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar comentario');
    }
  };

  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión para dar like');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes === 0 ? 'Ahora' : `Hace ${diffMinutes}m`;
      }
      return `Hace ${diffHours}h`;
    }
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  if (loading && comments.length === 0) {
    return <div className="comments-loading">Cargando comentarios...</div>;
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">💬 Debates y Comentarios ({comments.length})</h3>

      {/* Formulario de nuevo comentario */}
      <form onSubmit={handleSubmitComment} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Comparte tu opinión sobre este personaje..."
          rows="3"
          required
        />
        <button type="submit" className="btn-primary">
          Publicar Comentario
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">Sé el primero en comentar sobre este personaje 🎯</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-header">
                <img
                  src={comment.author?.avatar || 'https://via.placeholder.com/40'}
                  alt={comment.author?.username}
                  className="comment-avatar"
                />
                <div className="comment-meta">
                  <span className="comment-author">{comment.author?.username || 'Anónimo'}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
              </div>

              <div className="comment-content">{comment.content}</div>

              <div className="comment-actions">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  className="btn-like"
                >
                  👍 {comment.likes > 0 && comment.likes}
                </button>
                <button
                  onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                  className="btn-reply"
                >
                  💬 Responder
                </button>
                {currentUser && currentUser._id === comment.userId && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="btn-delete"
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>

              {/* Formulario de respuesta */}
              {replyTo === comment._id && (
                <div className="reply-form">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Responder a ${comment.author?.username}...`}
                    rows="2"
                  />
                  <div className="reply-actions">
                    <button
                      onClick={() => handleSubmitReply(comment._id)}
                      className="btn-primary btn-sm"
                    >
                      Enviar Respuesta
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                      className="btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Respuestas */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="reply-item">
                      <div className="comment-header">
                        <img
                          src={reply.author?.avatar || 'https://via.placeholder.com/32'}
                          alt={reply.author?.username}
                          className="reply-avatar"
                        />
                        <div className="comment-meta">
                          <span className="comment-author">{reply.author?.username || 'Anónimo'}</span>
                          <span className="comment-date">{formatDate(reply.createdAt)}</span>
                        </div>
                      </div>
                      <div className="comment-content">{reply.content}</div>
                      <div className="comment-actions">
                        <button
                          onClick={() => handleLikeComment(reply._id)}
                          className="btn-like btn-sm"
                        >
                          👍 {reply.likes > 0 && reply.likes}
                        </button>
                        {currentUser && currentUser._id === reply.userId && (
                          <button
                            onClick={() => handleDeleteComment(reply._id)}
                            className="btn-delete btn-sm"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
