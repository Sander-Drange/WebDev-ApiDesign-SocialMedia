import mongoose from 'mongoose';
import { POST_CATEGORIES } from '../enums/categoryEnum.js';
import { REACTIONS } from '../enums/reactionEnum.js';

const CATEGORY_ENUM = POST_CATEGORIES.map((cat) => cat.value);
const REACTIONS_ENUM = REACTIONS.map((cat) => cat.value);

const ReactionSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      type: {
         type: String,
         enum: REACTIONS_ENUM,
         required: true,
      },
   },
   { _id: false }
);

const postSchema = new mongoose.Schema({
   description: { type: String, required: true },
   image: { type: String, default: '' },
   category: { type: String, enum: CATEGORY_ENUM, required: true },
   author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },
   comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
   createdAt: { type: Date, default: Date.now },
   reactions: [ReactionSchema],
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;
