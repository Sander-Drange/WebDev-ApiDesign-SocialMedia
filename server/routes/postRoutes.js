import express from 'express';
import {
   createPost,
   deletePost,
   getAllPosts,
   getPostById,
   reactToPost,
   updatePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { addComment } from '../controllers/commentController.js';

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', getAllPosts);
router.get('/:postId', getPostById);
router.post('/:postId/comments', protect, addComment);
router.post('/:postId/react', protect, reactToPost);
router.put('/:postId', protect, updatePost);
router.delete('/:postId', protect, deletePost);

export default router;
