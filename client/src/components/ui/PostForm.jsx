import React, { useState } from 'react';
import '../../styles/PostForm.css';

const PostForm = ({
   description,
   setDescription,
   image,
   setImage,
   category,
   setCategory,
   handleSubmit,
   categories,
   isEditing = false,
}) => {
   const [submitAttempted, setSubmitAttempted] = useState(false);

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onloadend = () => {
            setImage(reader.result);
         };
      }
   };

   const trimmedDescription = description.trim();
   const isValidDescription =
      trimmedDescription.length >= 10 && trimmedDescription.length <= 1000;

   let noticeMessage = '';
   if (
      submitAttempted &&
      trimmedDescription.length > 0 &&
      !isValidDescription
   ) {
      if (trimmedDescription.length < 10) {
         noticeMessage =
            'Your post is too short. It should have at least 10 characters.';
      } else if (trimmedDescription.length > 1000) {
         noticeMessage =
            'Your post is too long. It should have at most 1000 characters.';
      }
   }

   const onSubmit = (e) => {
      e.preventDefault();
      setSubmitAttempted(true);
      if (!isValidDescription) {
         return;
      }
      handleSubmit(e);
   };

   return (
      <div className="post-form-container">
         <div className="post-form-header">
            {isEditing ? 'Updating Post' : 'Create a New Post'}
         </div>

         <form onSubmit={onSubmit} className="post-form">
            <textarea
               className="form-input"
               placeholder="Write something..."
               value={description}
               onChange={(e) => setDescription(e.target.value)}
            />
            {noticeMessage && <div className="notice">{noticeMessage}</div>}

            <input
               className="form-input"
               type="file"
               accept="image/*"
               onChange={handleImageChange}
            />
            {image && <img src={image} alt="Preview" />}

            <select
               className="form-input"
               value={category}
               onChange={(e) => setCategory(e.target.value)}
            >
               {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                     {cat.label}
                  </option>
               ))}
            </select>

            <button className="submit-button" type="submit">
               {isEditing ? 'Update Post' : 'Create Post'}
            </button>
         </form>
      </div>
   );
};

export default PostForm;
