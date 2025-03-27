import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { POST_CATEGORIES } from '../../enums/PostEnum.jsx';
import useAuth from '../components/hooks/useAuth';
import socket from '../socket.js';
import APP_URL from '../components/config.js';

function Home() {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [user, setUser] = useState(null);
   const [selectedCategory, setSelectedCategory] = useState('All');
   const navigate = useNavigate();
   const { loggedIn } = useAuth();

   useEffect(() => {
      if (loggedIn) {
         fetch(`${APP_URL}/api/users/profile`, {
            method: 'GET',
            credentials: 'include',
         })
            .then((response) => {
               if (!response.ok)
                  throw new Error('Failed to fetch user profile');
               return response.json();
            })
            .then(setUser)
            .catch((err) => console.error('Error fetching user:', err));
      }
   }, [loggedIn]);

   useEffect(() => {
      fetch(`${APP_URL}/api/posts`, { credentials: 'include' })
         .then((response) => {
            if (!response.ok) throw new Error('Failed to fetch posts.');
            return response.json();
         })
         .then((data) => {
            setPosts(data);
            setLoading(false);
         })
         .catch((err) => {
            setError(err.message);
            setLoading(false);
         });

      socket.on('updateFeed', (newPost) => {
         setPosts((prevPosts) =>
            prevPosts.some((post) => post._id === newPost._id)
               ? prevPosts
               : [newPost, ...prevPosts]
         );
      });

      socket.on('updateReaction', ({ postId, reaction }) => {
         setPosts((prevPosts) =>
            prevPosts.map((post) =>
               post._id !== postId
                  ? post
                  : {
                       ...post,
                       reactions: [
                          ...post.reactions.filter(
                             (r) => r.user !== reaction.user
                          ),
                          reaction,
                       ],
                    }
            )
         );
      });

      return () => {
         socket.off('updateFeed');
         socket.off('updateReaction');
      };
   }, []);

   const handleReaction = async (e, postId, reactionType) => {
      e.stopPropagation();
      if (!loggedIn) {
         alert('You must be logged in to react!');
         return;
      }
      try {
         const response = await fetch(`${APP_URL}/api/posts/${postId}/react`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ reactionType }),
         });

         if (!response.ok) throw new Error('Failed to react to post.');

         const data = await response.json();
         const updatedPost = data.post;
         setPosts((prevPosts) =>
            prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
         );
      } catch (err) {
         console.error('Reaction Error:', err);
         alert(err.message);
      }
   };

   const filteredPosts =
      selectedCategory === 'All'
         ? posts
         : posts.filter((post) => post.category === selectedCategory);

   if (loading) return <h2>Loading...</h2>;
   if (error) return <h2>Error: {error}</h2>;

   return (
      <>
         <Navbar />
         <div className="home-container">
            <div className="sidebar">
               <h3>Categories</h3>
               <ul>
                  <li
                     className={
                        selectedCategory === 'All' ? 'active-category' : ''
                     }
                     onClick={() => setSelectedCategory('All')}
                  >
                     All Categories
                  </li>
                  {POST_CATEGORIES.map((category, index) => (
                     <li
                        key={index}
                        className={
                           selectedCategory === category.value
                              ? 'active-category'
                              : ''
                        }
                        onClick={() => setSelectedCategory(category.value)}
                     >
                        {category.label}
                     </li>
                  ))}
               </ul>
            </div>

            <div className="feed">
               {filteredPosts.length === 0 ? (
                  <p>No posts available in this category.</p>
               ) : (
                  filteredPosts.map((post) => (
                     <div
                        key={post._id}
                        onClick={(e) => {
                           if (
                              !e.target.closest('.reaction-popup') &&
                              !e.target.closest('.reaction-summary')
                           ) {
                              navigate(`/posts/${post._id}`);
                           }
                        }}
                     >
                        <Card
                           post={post}
                           handleReaction={handleReaction}
                           userReaction={
                              post.reactions.find((r) => r.user === user?._id)
                                 ?.type
                           }
                           reactions={post.reactions}
                        />
                     </div>
                  ))
               )}
            </div>
         </div>
      </>
   );
}

export default Home;
