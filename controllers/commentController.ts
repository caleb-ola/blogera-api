import { Request, RequestHandler } from "express";
import AsyncHandler from "../utils/asyncHandler";
import Comment from "../models/commentModel";
import AppError from "../utils/appError";
import Post from "../models/postModel";

interface CustomRequest extends Request {
  currentUser?: any;
}

export const createComment: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { PID } = req.params;
    const { comment } = req.body;
    const { currentUser } = req;

    if (!comment) throw new AppError("Comment is required", 400);

    const post = await Post.findOne({ PID });
    if (!post) throw new AppError("Blog post not found", 404);

    const newComment = new Comment({
      comment,
      user: currentUser.id,
      post: post.id,
    });

    await newComment.save();

    post.comments.push(newComment.id);

    await post.save();

    res.status(201).json({
      status: "success",
      data: {
        message: "Comment added successfully",
        data: newComment,
      },
    });
  }
);

export const getAllComments: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { PID } = req.params;

    const blogPost = await Post.findOne({ PID });
    if (!blogPost) throw new AppError("Blog post not found", 404);

    const postComments = await Comment.find({ post: blogPost.id });
    if (!postComments) throw new AppError("Comment not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        data: postComments,
      },
    });
  }
);

export const getComment: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { PID, comment_id } = req.params;

    const blogPost = await Post.findOne({ PID });
    if (!blogPost) throw new AppError("Post not found", 404);

    // const comment = await Comment.findOne({
    //   //   post: blogPost.id,
    //   id: comment_id,
    // });

    const comment = await Comment.findById(comment_id)
      .populate("user", "name email username slug")
      .populate("post", "title");

    if (!comment) throw new AppError("Comment not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        data: comment,
      },
    });
  }
);

export const updateComment: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { PID, comment_id } = req.params;
    const { comment } = req.body;
    const { currentUser } = req;

    if (!comment) throw new AppError("Comment is required", 400);

    const blogPost = await Post.findOne({ PID });
    if (!blogPost) throw new AppError("Post not found", 404);

    const updateComment = await Comment.findById(comment_id);

    if (!updateComment) throw new AppError("Not found", 404);

    if (currentUser.id !== updateComment.user.toString())
      throw new AppError("You are not authorized to perform this action", 404);

    updateComment.comment = comment;
    await updateComment.save();

    res.status(200).json({
      status: "success",
      data: {
        message: "Comment updated successfully",
        data: updateComment,
      },
    });
  }
);

export const deleteCommment: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { PID, comment_id } = req.params;
    const { currentUser } = req;

    const post = await Post.findOne({ PID });
    if (!post) throw new AppError("Post not found", 404);

    const comment = await Comment.findById(comment_id);

    if (!comment) throw new AppError("Not found", 404);

    if (comment.user.toString() !== currentUser.id)
      throw new AppError("You are not authorized to perform this action", 401);

    const deleteComment = await Comment.findByIdAndDelete(comment_id);

    const commentIndex = post.comments.indexOf(comment_id);
    if (commentIndex === -1) {
      throw new AppError("Comments deos not exist in post", 404);
    } else {
      post.comments.splice(commentIndex, 1);
      await post.save();
    }

    res.status(204).json({
      status: "success",
    });
  }
);
