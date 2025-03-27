import User from '../models/user.js';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:1234';

dotenv.config();

const generateToken = (userId) => {
   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '1d',
   });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = (req, res) => {
   res.redirect(`${CLIENT_URL}/profile`);
};

export const googleTokenAuth = async (req, res) => {
   try {
      const { token } = req.body;
      const ticket = await client.verifyIdToken({
         idToken: token,
         audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { sub, name, email, picture } = ticket.getPayload();

      let user = await User.findOne({ googleId: sub });
      if (!user) {
         user = await User.create({
            googleId: sub,
            username: name,
            email: email,
            profilePicture: picture,
         });
      }

      const jwtToken = generateToken(user._id);

      res.cookie('token', jwtToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 1 * 60 * 60 * 1000,
      });

      res.json({ message: 'Google login successful', user });
   } catch (error) {
      console.error('Google token verification failed:', error);
      res.status(401).json({ message: 'Invalid Google token' });
   }
};

export const logout = (req, res, next) => {
   req.logout((err) => {
      if (err) return next(err);
      res.redirect(`${CLIENT_URL}/login`);
   });
};
