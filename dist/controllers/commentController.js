"use strict";
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
exports.deleteCommment = exports.updateComment = exports.getComment = exports.getAllComments = exports.createComment = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
const appError_1 = __importDefault(require("../utils/appError"));
const postModel_1 = __importDefault(require("../models/postModel"));
exports.createComment = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID } = req.params;
    const { comment } = req.body;
    const { currentUser } = req;
    if (!comment)
        throw new appError_1.default("Comment is required", 400);
    const post = yield postModel_1.default.findOne({ PID });
    if (!post)
        throw new appError_1.default("Blog post not found", 404);
    const newComment = new commentModel_1.default({
        comment,
        user: currentUser.id,
        post: post.id,
    });
    yield newComment.save();
    post.comments.push(newComment.id);
    yield post.save();
    res.status(201).json({
        status: "success",
        data: {
            message: "Comment added successfully",
            data: newComment,
        },
    });
}));
exports.getAllComments = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID } = req.params;
    const blogPost = yield postModel_1.default.findOne({ PID });
    if (!blogPost)
        throw new appError_1.default("Blog post not found", 404);
    const postComments = yield commentModel_1.default.find({ post: blogPost.id });
    if (!postComments)
        throw new appError_1.default("Comment not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: postComments,
        },
    });
}));
exports.getComment = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID, comment_id } = req.params;
    const blogPost = yield postModel_1.default.findOne({ PID });
    if (!blogPost)
        throw new appError_1.default("Post not found", 404);
    // const comment = await Comment.findOne({
    //   //   post: blogPost.id,
    //   id: comment_id,
    // });
    const comment = yield commentModel_1.default.findById(comment_id)
        .populate("user", "name email username slug")
        .populate("post", "title");
    if (!comment)
        throw new appError_1.default("Comment not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: comment,
        },
    });
}));
exports.updateComment = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID, comment_id } = req.params;
    const { comment } = req.body;
    const { currentUser } = req;
    if (!comment)
        throw new appError_1.default("Comment is required", 400);
    const blogPost = yield postModel_1.default.findOne({ PID });
    if (!blogPost)
        throw new appError_1.default("Post not found", 404);
    const updateComment = yield commentModel_1.default.findById(comment_id);
    if (!updateComment)
        throw new appError_1.default("Not found", 404);
    if (currentUser.id !== updateComment.user.toString())
        throw new appError_1.default("You are not authorized to perform this action", 404);
    updateComment.comment = comment;
    yield updateComment.save();
    res.status(200).json({
        status: "success",
        data: {
            message: "Comment updated successfully",
            data: updateComment,
        },
    });
}));
exports.deleteCommment = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID, comment_id } = req.params;
    const { currentUser } = req;
    const post = yield postModel_1.default.findOne({ PID });
    if (!post)
        throw new appError_1.default("Post not found", 404);
    const comment = yield commentModel_1.default.findById(comment_id);
    if (!comment)
        throw new appError_1.default("Not found", 404);
    if (comment.user.toString() !== currentUser.id)
        throw new appError_1.default("You are not authorized to perform this action", 401);
    const deleteComment = yield commentModel_1.default.findByIdAndDelete(comment_id);
    const commentIndex = post.comments.indexOf(comment_id);
    if (commentIndex === -1) {
        throw new appError_1.default("Comments deos not exist in post", 404);
    }
    else {
        post.comments.splice(commentIndex, 1);
        yield post.save();
    }
    res.status(204).json({
        status: "success",
    });
}));
