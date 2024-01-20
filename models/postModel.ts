import mongoose, { Schema } from "mongoose";
import { generateRandomPostID } from "../utils/misc";

interface AuthorTypes extends mongoose.Document {
  name: String;
  email: String;
  username: String;
  slug: String;
  id: String;
}
interface PostTypes extends mongoose.Document {
  id?: any;
  title: string;
  content: string;
  author: { type: Schema.Types.ObjectId; ref: "User" };
  image: string;
  tags: string;
  category: { type: Schema.Types.ObjectId; ref: "Category" };
  reads: number;
  likes: Array<{ type: Schema.Types.ObjectId; ref: "User" }>;
  comments: string[];
  PID: string;
}

const AuthorSchema = new mongoose.Schema<AuthorTypes>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    slug: { type: String, required: true },
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
      },
    },
  }
);

const PostSchema = new mongoose.Schema<PostTypes>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: String,
    tags: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    reads: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    PID: String,
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

// PostSchema.pre("save", function (next) {
//   if (this.isModified("likes") || this.isModified("reads")) return next();
//   this.PID = generateRandomPostID();
//   next();
// });

const Post = mongoose.model<PostTypes>("Post", PostSchema);

export default Post;
