import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Post from '../models/post.js';
import User from '../models/user.js';

dotenv.config();

const generateToken = (userId) => {
   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '1d',
   });
};

export const registerUser = async (req, res) => {
   const { username, email, password } = req.body;
   const userExists = await User.findOne({ email });
   if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
   }
   const user = await User.create({
      username,
      email,
      password,
   });
   if (user) {
      const token = generateToken(user._id);
      res.cookie('token', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 1 * 60 * 60 * 1000,
      });
      res.status(201).json({
         _id: user._id,
         username: user.username,
         email: user.email,
      });
   } else {
      res.status(400).json({ message: 'Invalid user data' });
   }
};

export const loginUser = async (req, res) => {
   const { email, password } = req.body;
   const user = await User.findOne({ email });

   if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
   }

   const token = generateToken(user._id);

   res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000,
   });

   res.json({ message: 'Login successful', user });
};

export const getUserProfile = async (req, res) => {
   try {
      if (!req.user) {
         return res
            .status(401)
            .json({ message: 'Unauthorized: No user data found.' });
      }
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
         res.clearCookie('token');
         return res
            .status(404)
            .json({ message: 'User not found, logging out' });
      }
      res.json({
         username: user.username,
         email: user.email,
         profilePicture: user.profilePicture || '',
         bio: user.bio || '',
         posts: await Post.find({ author: user._id }),
      });
   } catch (error) {
      console.error('Error fetching user profile:', error);
      res.clearCookie('token');
      res.status(401).json({ message: 'Session expired, please log in again' });
   }
};

export const logoutUser = async (req, res) => {
   res.clearCookie('token');
   res.json({ message: 'Logged out successfully' });
};

export const updateProfile = async (req, res) => {
   try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      console.log('Received bio:', req.body.bio);
      console.log('Received file:', req.file);

      if (req.body.bio) {
         user.bio = req.body.bio;
      }
      if (req.file) {
         user.profilePicture = `/uploads/${req.file.filename}`;
      }
      await user.save();
      res.status(200).json({
         username: user.username,
         email: user.email,
         profilePicture: user.profilePicture || '',
         bio: user.bio || '',
         posts: await Post.find({ author: user._id }),
      });
   } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error' });
   }
};
