import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateRandomUsername from "../utils/randomStringGen";

interface PostTypes extends mongoose.Document {
  title: string;
  content: string;
  image: string;
  tags: string;
  category: { type: Schema.Types.ObjectId; ref: "Category" };
  reads: number;
  likes: Array<{ type: Schema.Types.ObjectId; ref: "User" }>;
  comments: string[];
  PID: string;
}

export interface UserTypes extends mongoose.Document {
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar: string;
  bannerImage: string;
  location: string;
  role: string;
  gender: string;
  password: string;
  favorites: string[];
  posts: Array<{ type: Schema.Types.ObjectId; ref: "Post" }>;
  // confirmPassword: string | undefined;
  slug: string;
  lastLogin: string;
  passwordChangedAt: string | number;
  passwordResetToken: string | undefined;
  passwordResetExpires: string | undefined;
  isVerified: boolean;
  verificationToken: string | undefined;
  verificationTokenExpires: string | undefined;
  active: boolean;
  createVerificationToken(): string;
  createPasswordResetToken(): string;
  changePasswordAfter(timestamp: number): boolean;
  checkPassword: (
    inputPassword: string,
    userPassword: string
  ) => Promise<boolean>;
}

// // An interface that describes the properties that a User Document has
// interface UserDoc extends UserTypes, mongoose.Document {
//   createVerificationToken(): string;
//   createPasswordResetToken(): string;
//   changedPasswordAfter(timestamp: number): boolean;
//   checkPassword(inputPassword: string, userPassword: string): boolean;
// }

// // An interface that describes the properties that a user model has
// interface UserModel extends mongoose.Model<UserDoc> {
//   build(attrs: UserTypes): UserDoc;
// }

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
const userSchema = new mongoose.Schema<UserTypes>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      max: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lower: true,
      validate: [validator.isEmail, "Enter a valid email"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lower: true,
    },
    bio: {
      type: String,
      max: [250, "Bio cannot be more than 250 characters"],
    },
    avatar: String,
    bannerImage: String,
    location: String,
    role: {
      type: String,
      enum: ["user", "admin"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },
    password: {
      type: String,
      min: [5, "Password cannot be less than 5 characters"],
      required: [true, "Password is required"],
      select: false,
    },
    // confirmPassword: {
    //   type: String,
    //   min: [5, "Passwords cannot be less than 5 characters"],
    //   required: [true, "Confirm password is required"],
    //   validate: {
    //     validator: function (el: String) {
    //       el === (this as UserTypes).password;
    //     },
    //     message: "Passwords must be the same",
    //   },
    // },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    slug: String,
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
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

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  // this.select("-password");
  next();
});

userSchema.pre("save", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
  // this.username = generateRandomUsername(
  //   this.name.toLowerCase().replace(/\s/g, "_"),
  //   12
  // );
  next();
});

userSchema.pre("findOneAndUpdate", function (next) {
  // Access the update object
  const update: any = this.getUpdate();

  if (update?.name) {
    update.slug = slugify(update.name, { lower: true });
  }

  // Update the slug and username fields in the update object
  if (update?.username) {
    update.username = update.username.replace(/\s/g, "_");
  }

  // Continue with the update operation
  next();
});

userSchema.pre("save", async function (next) {
  if (
    !this.isModified("password") ||
    this.isModified("favorites") ||
    this.isModified("posts")
  )
    return next();

  this.password = await bcrypt.hash(this.password, 12);
  // this.confirmPassword = undefined;
  next();
});

// PASSWORD
userSchema.methods.checkPassword = async function (
  inputPassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (
  JWTTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10);

    return JWTTimestamp < changedTimestamp / 1000;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createVerificationToken = function (): string {
  const token = crypto.randomBytes(18).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model<UserTypes>("User", userSchema);

export default User;
