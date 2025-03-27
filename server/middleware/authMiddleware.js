import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

export const protect = async (req, res, next) => {
   let token = req.cookies.token;

   if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
   } catch (error) {
      console.error('Not authorized, token failed', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
   }
};
