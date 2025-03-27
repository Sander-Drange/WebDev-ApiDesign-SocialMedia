import express from 'express';
import {
   registerUser,
   loginUser,
   getUserProfile,
   logoutUser,
   updateProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/logout', logoutUser);
router.put(
   '/update-profile',
   protect,
   upload.single('profilePicture'),
   updateProfile
);

export default router;
