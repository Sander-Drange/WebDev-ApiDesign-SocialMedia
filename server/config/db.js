import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
   try {
      await mongoose.connect(process.env.MONGO_DB_CONNECTION);
      console.log('Connected to MongoDB');
   } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
   }
};

export default connectDB;
