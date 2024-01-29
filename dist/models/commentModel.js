"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const CommentSchema = new mongoose_1.default.Schema({
    comment: {
        type: String,
        required: true,
        max: [200, "Comment cannot be more than 200."],
    },
    user: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
    },
    post: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Post",
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
const Comment = mongoose_1.default.model("Comment", CommentSchema);
exports.default = Comment;
