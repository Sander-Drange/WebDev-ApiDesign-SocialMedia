import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/ui/PostForm';
import Navbar from '../components/layout/Navbar';
import { POST_CATEGORIES } from '../../enums/PostEnum';
import '../styles/CreatePost.css';
import APP_URL from '../components/config';

export default function CreatePost({ addPost = () => {} }) {
   const navigate = useNavigate();
   const [description, setDescription] = useState('');
   const [image, setImage] = useState(null);
   const [category, setCategory] = useState(POST_CATEGORIES[0].value);
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      if (!description.trim()) {
         setError('Post description cannot be empty.');
         return;
      }

      setLoading(true);
      try {
         const response = await fetch(`${APP_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
               description,
               image: image ? image : '',
               category,
               createdAt: new Date().toISOString(),
            }),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Failed to create post.');
         }

         addPost(data);
         alert('Post created.');

         setDescription('');
         setImage(null);
         setCategory(POST_CATEGORIES[0].value);
         navigate('/');
      } catch (err) {
         console.error('Error creating post:', err);
         setError(err.message || 'Failed to create the post.');
         alert(err.message || 'Failed to create the post.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         <Navbar />
         <div className="flex justify-center mt-10">
            <div className="w-full max-w-md">
               {error && <p className="error-message">{error}</p>}
               {loading && <p>Creating post...</p>}
               <PostForm
                  description={description}
                  setDescription={setDescription}
                  image={image}
                  setImage={setImage}
                  category={category}
                  setCategory={setCategory}
                  categories={POST_CATEGORIES}
                  handleSubmit={handleSubmit}
               />
            </div>
         </div>
      </>
   );
}
