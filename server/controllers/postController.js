import Post from '../models/post.js';
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
   const { description, image, category } = req.body;

   console.log('Request received with data:', req.body);
   console.log('Authenticated user:', req.user);

   if (!description || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
   }

   try {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const postsCount = await Post.countDocuments({
         author: req.user._id,
         createdAt: { $gte: oneHourAgo },
      });

      if (postsCount >= 5) {
         return res.status(429).json({
            message:
               'You have reached the limit of 5 posts per hour. Please try again later.',
         });
      }

      const post = new Post({
         description,
         image: image || '',
         category,
         author: req.user._id,
         createdAt: new Date().toISOString(),
      });

      const savedPost = await post.save();
      res.status(201).json(savedPost);
   } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
   }
};

export const deletePost = async (req, res) => {
   const { postId } = req.params;

   try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
         return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await Post.findById(postId);
      if (!post) {
         return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author.toString() !== req.user._id.toString()) {
         return res
            .status(403)
            .json({ message: 'Not authorized to delete this post' });
      }

      await Post.deleteOne({ _id: postId });

      res.status(200).json({ message: 'Post deleted successfully' });
   } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
   }
};

export const updatePost = async (req, res) => {
   const { postId } = req.params;
   const { description, image, category } = req.body;

   try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
         return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await Post.findById(postId);
      if (!post) {
         return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author.toString() !== req.user._id.toString()) {
         return res
            .status(403)
            .json({ message: 'Not authorized to update this post' });
      }

      post.description = description || post.description;
      post.image = image || post.image;
      post.category = category || post.category;

      const updatedPost = await post.save();
      res.status(200).json(updatedPost);
   } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
   }
};

export const getAllPosts = async (req, res) => {
   try {
      const posts = await Post.find()
         .sort({ createdAt: -1 })
         .populate('author', 'username');

      res.json(posts);
   } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Server error' });
   }
};

export const getPostById = async (req, res) => {
   try {
      console.log('Fetching post:', req.params.postId);

      if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
         console.log('Invalid Post ID format:', req.params.postId);
         return res.status(400).json({ message: 'Invalid post ID format' });
      }

      const post = await Post.findById(req.params.postId)
         .populate('author', 'username')
         .populate({
            path: 'comments',
            populate: { path: 'author', select: 'username' },
         })
         .populate({
            path: 'reactions.user',
            select: 'username',
         })
         .lean();

      if (!post) {
         console.log('Post not found');
         return res.status(404).json({ message: 'Post not found' });
      }

      console.log('Post fetched successfully:', post);

      if (!Array.isArray(post.reactions)) {
         post.reactions = [];
      }

      return res.status(200).json(post);
   } catch (error) {
      console.error('Error fetching post:', error);
      return res
         .status(500)
         .json({ message: 'Server error', error: error.message });
   }
};

export const reactToPost = async (req, res) => {
   const { postId } = req.params;
   const { reactionType } = req.body;

   if (!req.user || !req.user._id) {
      console.error('Unauthorized request, user is missing:', req.user);
      return res.status(401).json({ message: 'Unauthorized, please log in.' });
   }

   try {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
         return res.status(400).json({ message: 'Invalid post ID' });
      }

      if (!reactionType) {
         return res.status(400).json({ message: 'Reaction type is required' });
      }

      const post = await Post.findById(postId);
      if (!post) {
         return res.status(404).json({ message: 'Post not found' });
      }

      const existingIndex = post.reactions.findIndex(
         (r) => r.user.toString() === req.user._id.toString()
      );

      if (existingIndex > -1) {
         post.reactions[existingIndex].type = reactionType;
      } else {
         post.reactions.push({
            user: req.user._id,
            type: reactionType,
         });
      }

      await post.save();

      const updatedPost = await Post.findById(postId)
         .populate('author', 'username')
         .populate({
            path: 'reactions.user',
            select: 'username',
         });

      return res.status(200).json({
         message: 'Reaction updated successfully',
         post: updatedPost,
      });
   } catch (error) {
      console.error('Error reacting to post:', error);
      return res
         .status(500)
         .json({ message: 'Server error', error: error.message });
   }
};
