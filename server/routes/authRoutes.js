import express from 'express';
import passport from 'passport';
import {
   googleAuth,
   googleTokenAuth,
   logout,
} from '../controllers/authController.js';

const router = express.Router();

router.get(
   '/google',
   passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
   '/google/callback',
   passport.authenticate('google', { failureRedirect: '/login' }),
   googleAuth
);

router.post('/google/token', googleTokenAuth);

// Logout route
router.get('/logout', logout);

export default router;
