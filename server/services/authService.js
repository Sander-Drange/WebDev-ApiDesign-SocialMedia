import User from '../models/user.js';

export const findOrCreateUser = async (profile) => {
   let user = await User.findOne({ googleId: profile.id });

   if (!user) {
      user = await User.create({
         googleId: profile.id,
         username: profile.displayName,
         email: profile.emails[0]?.value,
         profilePicture: profile.photos[0]?.value,
      });
   }

   return user;
};
