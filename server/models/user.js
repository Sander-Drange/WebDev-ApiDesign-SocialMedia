import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const userSchema = new Schema({
   username: { type: String, required: true },
   password: {
      type: String,
      validate: {
         validator: function (value) {
            return this.googleId || value;
         },
         message: 'Password is required if no Google ID is present.',
      },
   },
   email: { type: String, required: true },
   profilePicture: { type: String },
   bio: { type: String },
   role: { type: String, enum: ['user', 'verified'], default: 'user' },
   posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
   friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
   reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
   comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
   lastPostTimestamp: { type: Date },
});

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
   } catch (error) {
      next(error);
   }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
   return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
