import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import http from 'http';
import passport from './config/passport.js';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_DB_CONNECTION', 'SESSION_SECRET', 'CLIENT_URL'];
requiredEnvVars.forEach((envVar) => {
   if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
   }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:1234';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO once
const io = new Server(server, {
   cors: {
      origin: CLIENT_URL,
      credentials: true,
   },
});
app.set('io', io);

// Logging middleware
app.use(morgan('dev'));

// Session configuration
app.use(
   session({
      name: 'myapp.sid',
      secret: process.env.SESSION_SECRET || 'supersecret',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
         mongoUrl: process.env.MONGO_DB_CONNECTION,
         collectionName: 'sessions',
      }),
      cookie: {
         maxAge: 1000 * 60 * 60, // 1 hour
         secure: process.env.NODE_ENV === 'production',
         httpOnly: true,
         sameSite: 'lax',
      },
   })
);

// Initialize Passport.js authentication
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(
   cors({
      origin: CLIENT_URL,
      credentials: true,
   })
);

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads
app.use(
   '/uploads',
   express.static(path.join(__dirname, 'uploads'), { fallthrough: false })
);

// **** API Routes - Defineres før vi serverer statiske filer ****
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// **** Server klient-siden (statisk) ****
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath, { fallthrough: false }));

// Fallback for client-side routing (må komme etter static-middleware)
app.get('*', (req, res) => {
   res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Socket.IO events
io.on('connection', (socket) => {
   console.log('User connected:', socket.id);

   socket.on('newPost', (post) => {
      io.emit('updateFeed', post);
   });

   socket.on('newComment', (data) => {
      console.log('New comment received:', data);
      socket.broadcast.emit('updateComments', data);
   });

   socket.on('react', ({ postId, reaction }) => {
      io.emit('updateReaction', { postId, reaction });
   });

   socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
   });
});

// Error handling middleware
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB and start the server
connectDB()
   .then(() => {
      server.listen(process.env.PORT, () => {
         console.log(
            `Server running on ${process.env.PORT || 'http://localhost:3000'}`
         );
      });
   })
   .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
   });

// Graceful shutdown
const gracefulShutdown = () => {
   console.log('Shutting down gracefully...');
   server.close(() => {
      console.log('Server closed.');
      process.exit(0);
   });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export { io };
