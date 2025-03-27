import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/ui/PostForm';
import { POST_CATEGORIES } from '../../enums/PostEnum';
import APP_URL from '../components/config';

const EditPostPage = () => {
   const { postId } = useParams();
   const location = useLocation();
   const navigate = useNavigate();

   const initialPost = location.state || {
      description: '',
      image: '',
      category: '',
   };

   const [description, setDescription] = useState(initialPost.description);
   const [image, setImage] = useState(initialPost.image);
   const [category, setCategory] = useState(initialPost.category);

   const handleSubmit = async (e) => {
      e.preventDefault();
      const updatedData = { description, image, category };

      try {
         const response = await fetch(`${APP_URL}/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updatedData),
         });

         if (!response.ok) {
            throw new Error('Failed to update post.');
         }

         await response.json();
         navigate('/profile');
      } catch (error) {
         console.error('Error updating post:', error);
         alert('Failed to update post. Please try again.');
      }
   };

   return (
      <div>
         <h2>Edit Post</h2>
         <PostForm
            description={description}
            setDescription={setDescription}
            image={image}
            setImage={setImage}
            category={category}
            setCategory={setCategory}
            handleSubmit={handleSubmit}
            categories={POST_CATEGORIES}
            isEditing={true}
         />
      </div>
   );
};

export default EditPostPage;
