import Comment from '../models/comment.js';
import Post from '../models/post.js';
import mongoose from 'mongoose';

export const addComment = async (req, res) => {
   try {
      const { text } = req.body;
      const { postId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
         return res.status(400).json({ message: 'Invalid post ID format' });
      }

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = new Comment({
         text,
         author: req.user._id,
      });

      await comment.save();
      post.comments.push(comment._id);
      await post.save();

      const populatedComment = await Comment.findById(comment._id).populate(
         'author',
         'username'
      );

      req.app
         .get('io')
         .emit('updateComments', { postId, comment: populatedComment });

      res.status(201).json(populatedComment);
   } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
   }
};
