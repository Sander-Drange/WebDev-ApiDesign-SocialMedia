import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
   new GoogleStrategy(
      {
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
         try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
               user = await User.create({
                  googleId: profile.id,
                  username: profile.displayName,
                  email: profile.emails[0]?.value,
                  profilePicture: profile.photos[0]?.value,
               });
            }
            return done(null, user);
         } catch (err) {
            return done(err, null);
         }
      }
   )
);

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
   try {
      const user = await User.findById(id);
      done(null, user);
   } catch (err) {
      done(err, null);
   }
});

export default passport;
