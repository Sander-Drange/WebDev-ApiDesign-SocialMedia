import React, { useEffect, useState } from 'react';
import '../styles/Profile.css';
import Navbar from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import useAuth from '../components/hooks/useAuth';
import Card from '../components/ui/Card';
import APP_URL from '../components/config';

const Profile = () => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const { loggedIn } = useAuth();
   const navigate = useNavigate();
   const [editing, setEditing] = useState(false);
   const [newBio, setNewBio] = useState('');
   const [newImage, setNewImage] = useState(null);
   const [previewImage, setPreviewImage] = useState('');
   const [uploading, setUploading] = useState(false);

   useEffect(() => {
      if (loggedIn === false) {
         navigate('/login');
         return;
      }

      if (loggedIn === null) return;

      const fetchProfile = async () => {
         try {
            setError(null);
            const response = await fetch(`${APP_URL}/api/users/profile`, {
               method: 'GET',
               credentials: 'include',
            });

            if (!response.ok) {
               throw new Error(
                  response.status === 401
                     ? 'Unauthorized: Please log in again.'
                     : 'Failed to fetch user profile.'
               );
            }

            const data = await response.json();
            setUser(data);
            setNewBio(data.bio || '');
            setPreviewImage(data.profilePicture || '');
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [loggedIn, navigate]);

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         if (!file.type.startsWith('image/')) {
            alert('Only image files are allowed!');
            return;
         }
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onloadend = () => {
            setPreviewImage(reader.result);
            setNewImage(file);
         };
      }
   };

   const handleSaveProfile = async () => {
      const formData = new FormData();
      formData.append('bio', newBio);
      if (newImage) {
         formData.append('profilePicture', newImage);
      }

      try {
         setUploading(true);
         const response = await fetch(`${APP_URL}/api/users/update-profile`, {
            method: 'PUT',
            credentials: 'include',
            body: formData,
         });

         if (!response.ok) {
            throw new Error('Failed to update profile.');
         }

         const updatedUser = await response.json();
         setUser(updatedUser);
         setEditing(false);
         setUploading(false);
      } catch (err) {
         console.error('Error updating profile:', err);
         setError('Failed to update profile. Please try again.');
         setUploading(false);
      }
   };

   const handleDeletePost = async (postId) => {
      try {
         const response = await fetch(`${APP_URL}/api/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
         });

         if (!response.ok) {
            throw new Error('Failed to delete post.');
         }

         setUser((prevUser) => ({
            ...prevUser,
            posts: prevUser.posts.filter((post) => post._id !== postId),
         }));
      } catch (error) {
         console.error('Error deleting post:', error);
         setError('Failed to delete post. Please try again.');
      }
   };

   if (loading) return <h2>Loading...</h2>;
   if (error) return <h2>Error: {error}</h2>;

   return (
      <>
         <Navbar />
         <div className="profile-container">
            <h2>Welcome, {user.username}!</h2>
            <div className="profile-header">
               <img
                  src={
                     user.profilePicture
                        ? `${APP_URL}${user.profilePicture}`
                        : '/default-profile.png'
                  }
                  alt="Profile"
                  className="profile-picture"
               />

               {editing && (
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageChange}
                  />
               )}
               <div className="profile-details">
                  <h1>{user.username}</h1>
                  <p>{user.email}</p>
               </div>
            </div>

            <div className="profile-bio">
               <h2>Bio</h2>
               {editing ? (
                  <textarea
                     value={newBio}
                     onChange={(e) => setNewBio(e.target.value)}
                     className="bio-input"
                  />
               ) : (
                  <p>{user.bio || 'No bio available.'}</p>
               )}
            </div>

            {editing ? (
               <button
                  className="save-button"
                  onClick={handleSaveProfile}
                  disabled={uploading}
               >
                  {uploading ? 'Saving...' : 'Save Profile'}
               </button>
            ) : (
               <button className="edit-button" onClick={() => setEditing(true)}>
                  Edit Profile
               </button>
            )}

            <div className="user-posts">
               <h2>Your Posts</h2>
               {user.posts.length === 0 ? (
                  <p>You haven't posted anything yet.</p>
               ) : (
                  user.posts
                     .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                     )
                     .map((post) => (
                        <Card
                           key={post._id}
                           post={post}
                           userId={user._id}
                           handleReaction={() => {}}
                           handleDeletePost={handleDeletePost}
                           handleUpdatePost={() =>
                              navigate(`/posts/edit/${post._id}`, {
                                 state: post,
                              })
                           }
                        />
                     ))
               )}
            </div>
         </div>
      </>
   );
};

export default Profile;
