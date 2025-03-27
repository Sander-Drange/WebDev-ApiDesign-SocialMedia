import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Card from '../components/ui/Card';
import '../styles/Post.css';
import '../styles/Card.css';
import useAuth from '../components/hooks/useAuth';
import { io } from 'socket.io-client';
import APP_URL from '../components/config';

const socket = io(`${APP_URL}`, { transports: ['websocket'] });

function Post() {
   const { postId } = useParams();
   const [post, setPost] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const { loggedIn } = useAuth();
   const [newComment, setNewComment] = useState('');

   // Fetch the post on mount
   useEffect(() => {
      const fetchPost = async () => {
         try {
            const response = await fetch(`${APP_URL}/api/posts/${postId}`, {
               credentials: 'include',
            });
            if (!response.ok) {
               throw new Error('Failed to fetch post.');
            }
            const data = await response.json();
            setPost(data);
            console.log('Post fetched:', data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };
      fetchPost();
   }, [postId]);

   // WebSocket listener for new comments
   useEffect(() => {
      const handleUpdateComments = ({ postId: incomingPostId, comment }) => {
         if (incomingPostId === postId) {
            setPost((prevPost) => {
               if (!prevPost || !prevPost.comments) return prevPost;
               if (prevPost.comments.some((c) => c._id === comment._id)) {
                  return prevPost;
               }
               return {
                  ...prevPost,
                  comments: [...prevPost.comments, comment],
               };
            });
            console.log('New comment received via socket:', comment);
         }
      };

      socket.on('updateComments', handleUpdateComments);

      return () => {
         socket.off('updateComments', handleUpdateComments);
      };
   }, [postId]);

   const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!loggedIn) {
         alert('You must be logged in to comment.');
         return;
      }

      try {
         const response = await fetch(
            `${APP_URL}/api/posts/${postId}/comments`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               credentials: 'include',
               body: JSON.stringify({ text: newComment }),
            }
         );

         if (!response.ok) {
            throw new Error('Failed to post comment.');
         }

         setNewComment('');
      } catch (err) {
         alert('Failed to add comment.');
      }
   };

   if (loading) return <h2>Loading...</h2>;
   if (error) return <h2>Error: {error}</h2>;
   if (!post) return <h2>Post not found.</h2>;

   return (
      <>
         <Navbar />
         <div className="post-container">
            <Card post={post} />
         </div>
         <div className="comments-container">
            <div className="comments-section">
               <h3>Comments</h3>
               {post.comments && post.comments.length === 0 ? (
                  <p className="no-comments">No comments yet.</p>
               ) : (
                  post.comments &&
                  post.comments.map((comment) => (
                     <div
                        key={comment._id || `${comment.text}-${Math.random()}`}
                        className="comment"
                     >
                        <p>
                           <strong>{comment.author?.username}:</strong>{' '}
                           {comment.text}
                        </p>
                     </div>
                  ))
               )}
               {loggedIn ? (
                  <form onSubmit={handleCommentSubmit} className="comment-form">
                     <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                     />
                     <button type="submit">Post</button>
                  </form>
               ) : (
                  <p>You must be logged in to comment.</p>
               )}
            </div>
         </div>
      </>
   );
}

export default Post;
