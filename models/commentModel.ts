import mongoose from "mongoose";
import { Schema } from "mongoose";

interface CommentTypes {
  comment: string;
  user: { type: Schema.Types.ObjectId; ref: "User" };
  post: { type: Schema.Types.ObjectId; ref: "Post" };
}

const CommentSchema = new mongoose.Schema<CommentTypes>(
  {
    comment: {
      type: String,
      required: true,
      max: [200, "Comment cannot be more than 200."],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Comment = mongoose.model<CommentTypes>("Comment", CommentSchema);

export default Comment;
