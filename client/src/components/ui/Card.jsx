import React from 'react';
import '../../styles/Card.css';
import ReactionButton from './ReactionButton';

const getReactionsCount = (reactionsArray) => {
   const counts = {};
   reactionsArray.forEach(({ type }) => {
      counts[type] = (counts[type] || 0) + 1;
   });
   return counts;
};

const getTotalReactions = (reactionsArray) => reactionsArray.length;

const getUserReaction = (reactionsArray, userId) => {
   const userReaction = reactionsArray.find((r) => r.user === userId);
   return userReaction ? userReaction.type : null;
};

function Card({
   post,
   handleReaction,
   userId,
   handleUpdatePost,
   handleDeletePost,
}) {
   if (!post) return null;

   const reactionsCount = getReactionsCount(post.reactions || []);
   const totalReactions = getTotalReactions(post.reactions || []);
   const userReaction = getUserReaction(post.reactions || [], userId);

   return (
      <div className="post">
         <div className="post-header">
            <span className="username">
               {post.author ? post.author.username : 'Unknown'}
            </span>
         </div>

         {post.image && (
            <img src={post.image} alt="Post" className="post-image" />
         )}

         <div className="post-content">{post.description}</div>

         <div className="post-meta">
            <p>
               <em>
                  Posted on {new Date(post.createdAt).toLocaleDateString()}
               </em>
            </p>
         </div>

         <div className="post-actions">
            <ReactionButton
               postId={post._id}
               userReaction={userReaction}
               reactions={reactionsCount}
               handleReaction={handleReaction}
            />
            <button>
               💬 {post.comments ? post.comments.length : 0} Comments
            </button>
            <button>{post.category}</button>
         </div>

         {handleUpdatePost && handleDeletePost && (
            <div className="post-buttons">
               <button className="update-button" onClick={handleUpdatePost}>
                  Update
               </button>
               <button
                  className="delete-button"
                  onClick={() => {
                     if (
                        window.confirm(
                           'Are you sure you want to delete this post?'
                        )
                     ) {
                        handleDeletePost(post._id);
                     }
                  }}
               >
                  Delete
               </button>
            </div>
         )}
      </div>
   );
}

export default Card;
