import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ReactionButton.css';
import APP_URL from '../config';

const REACTIONS = [
   { type: 'Like', emoji: '👍' },
   { type: 'Love', emoji: '❤️' },
   { type: 'Haha', emoji: '😂' },
   { type: 'Wow', emoji: '😮' },
   { type: 'Sad', emoji: '😢' },
   { type: 'Angry', emoji: '😡' },
];

const ReactionButton = ({
   postId,
   userReaction,
   reactions,
   handleReaction,
}) => {
   const [showReactions, setShowReactions] = useState(false);
   const [showPopup, setShowPopup] = useState(false);
   const [selectedReaction, setSelectedReaction] = useState(null);
   const [usersWhoReacted, setUsersWhoReacted] = useState([]);
   const popupRef = useRef(null);

   const totalReactions = Object.values(reactions || {}).reduce(
      (sum, count) => sum + count,
      0
   );

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (popupRef.current && !popupRef.current.contains(event.target)) {
            setShowPopup(false);
            setSelectedReaction(null);
         }
      };

      if (showPopup) {
         document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [showPopup]);

   const fetchUsersForReaction = async (reactionType) => {
      const url = `${APP_URL}/api/posts/${postId}`;
      console.log('Fetching post reactions from:', url);
      try {
         const response = await fetch(url, { credentials: 'include' });
         if (!response.ok) {
            const text = await response.text();
            console.error(
               'Fetch error - response not OK:',
               response.status,
               text
            );
            throw new Error('Failed to fetch post reactions.');
         }
         const post = await response.json();
         if (!post.reactions) {
            console.error('Fetched post does not contain reactions:', post);
            throw new Error('No reactions found in post.');
         }
         const users = post.reactions
            .filter((r) => r.type === reactionType)
            .map((r) =>
               r.user && r.user.username ? r.user.username : 'Unknown'
            );
         console.log('Fetched users for reaction', reactionType, users);
         setUsersWhoReacted(users);
         setSelectedReaction(reactionType);
      } catch (error) {
         console.error('Error fetching reactions:', error);
      }
   };

   return (
      <div className="reaction-container">
         {totalReactions > 0 && (
            <div
               className="reaction-summary enhanced-hover"
               onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup(true);
               }}
            >
               <span className="reaction-count">
                  {totalReactions} Reactions
               </span>
            </div>
         )}

         {showPopup && !selectedReaction && (
            <div className="reaction-popup" ref={popupRef}>
               <div className="reaction-popup-content">
                  <h3>Reactions</h3>
                  {Object.entries(reactions).map(([type, count]) =>
                     count > 0 ? (
                        <div
                           key={type}
                           className="reaction-popup-item clickable-reaction"
                           onClick={() => fetchUsersForReaction(type)}
                        >
                           {REACTIONS.find((r) => r.type === type)?.emoji}{' '}
                           {type}: {count}
                        </div>
                     ) : null
                  )}
               </div>
            </div>
         )}

         {showPopup && selectedReaction && (
            <div className="reaction-popup" ref={popupRef}>
               <div className="reaction-popup-content">
                  <h3>{selectedReaction} Reactions</h3>
                  {usersWhoReacted.length > 0 ? (
                     usersWhoReacted.map((username, index) => (
                        <p key={index} className="reaction-username">
                           {username}
                        </p>
                     ))
                  ) : (
                     <p>No reactions yet.</p>
                  )}
               </div>
            </div>
         )}

         <div
            className="reaction-button"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
         >
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  console.log('Reaction clicked:', { postId, userReaction });
                  if (typeof handleReaction === 'function') {
                     // Toggle between Like and Unlike
                     handleReaction(
                        e,
                        postId,
                        userReaction ? 'Unlike' : 'Like'
                     );
                  } else {
                     console.error('handleReaction is not defined!');
                  }
               }}
               className="main-reaction"
            >
               {userReaction
                  ? REACTIONS.find((r) => r.type === userReaction)?.emoji
                  : '👍'}
            </button>

            {showReactions && (
               <div className="reaction-menu" ref={popupRef}>
                  {REACTIONS.map(({ type, emoji }) => (
                     <button
                        key={type}
                        className="reaction-option"
                        onClick={(e) => {
                           e.stopPropagation();
                           if (typeof handleReaction === 'function') {
                              handleReaction(e, postId, type);
                           }
                        }}
                     >
                        {emoji}
                     </button>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

export default ReactionButton;
