import mongoose from "mongoose";
import slugify from "slugify";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface UserTypes extends mongoose.Document {
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
  // confirmPassword: string | undefined;
  slug: string;
  lastLogin: string;
  passwordChangedAt: string;
  passwordResetToken: string;
  passwordResetEXpires: string;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpires: string;
  active: boolean;
  createVerificationToken(): string;
  createPasswordResetToken(): string;
  changePasswordAfter(timestamp: number): boolean;
}

// // An interface that describes the properties that a User Document has
// interface UserDoc extends UserTypes, mongoose.Document {
//   createVerificationToken(): string;
//   createPasswordResetToken(): string;
//   changedPasswordAfter(timestamp: number): boolean;
// }

// // An interface that describes the properties that a user model has
// interface UserModel extends mongoose.Model<UserDoc> {
//   build(attrs: UserTypes): UserDoc;
// }

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
    slug: String,
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetEXpires: Date,
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
        // DOOOOO THIIISSSSS
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // this.confirmPassword = undefined;
  next();
});

// PASSWORD
userSchema.methods.checkPassword = async function (
  inputPassword: string,
  userPassword: string
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.paswordChangedAt.getTime(), 10);

    return JWTTimestamp > changedTimestamp / 1000;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetEXpires = Date.now() + 10 * 60 * 1000;

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
