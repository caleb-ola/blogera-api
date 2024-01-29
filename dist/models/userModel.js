"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
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
const PostSchema = new mongoose_1.default.Schema({
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
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    reads: { type: Number, default: 0 },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
    PID: String,
}, {
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
});
const userSchema = new mongoose_1.default.Schema({
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
        validate: [validator_1.default.isEmail, "Enter a valid email"],
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
    favorites: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
    posts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
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
}, {
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
});
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    // this.select("-password");
    next();
});
userSchema.pre("save", function (next) {
    if (this.name) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true });
    }
    // this.username = generateRandomUsername(
    //   this.name.toLowerCase().replace(/\s/g, "_"),
    //   12
    // );
    next();
});
userSchema.pre("findOneAndUpdate", function (next) {
    // Access the update object
    const update = this.getUpdate();
    if (update === null || update === void 0 ? void 0 : update.name) {
        update.slug = (0, slugify_1.default)(update.name, { lower: true });
    }
    // Update the slug and username fields in the update object
    if (update === null || update === void 0 ? void 0 : update.username) {
        update.username = update.username.replace(/\s/g, "_");
    }
    // Continue with the update operation
    next();
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password") ||
            this.isModified("favorites") ||
            this.isModified("posts"))
            return next();
        this.password = yield bcryptjs_1.default.hash(this.password, 12);
        // this.confirmPassword = undefined;
        next();
    });
});
// PASSWORD
userSchema.methods.checkPassword = function (inputPassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(inputPassword, userPassword);
    });
};
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10);
        return JWTTimestamp < changedTimestamp / 1000;
    }
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
userSchema.methods.createVerificationToken = function () {
    const token = crypto_1.default.randomBytes(18).toString("hex");
    this.verificationToken = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
    return token;
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
