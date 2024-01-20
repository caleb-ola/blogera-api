import { Router } from "express";
import {
  ToggleLikePost,
  createBlogPost,
  deleteBlogPost,
  getAllBlogPosts,
  getBlogPost,
  getBlogPostsByAuthor,
  AddRead,
  resizePostImage,
  updateBlogPost,
  uploadPostImage,
  getBlogPostsByCategory,
} from "../controllers/postController";
import protect from "../middlewares/protect";
import {
  createComment,
  deleteCommment,
  getAllComments,
  getComment,
  updateComment,
} from "../controllers/commentController";

const router = Router();

router
  .route("/")
  .get(getAllBlogPosts)
  .post(protect, uploadPostImage, resizePostImage, createBlogPost);

router
  .route("/:PID")
  .get(getBlogPost)
  .patch(protect, uploadPostImage, resizePostImage, updateBlogPost)
  .delete(protect, deleteBlogPost);
router.get("/:author_id/author", getBlogPostsByAuthor);
router.get("/:category_id/category", getBlogPostsByCategory);
router.patch("/:PID/toggle-like", protect, ToggleLikePost);
router.patch("/:PID/add-read", AddRead);

// COMMENTS
router
  .route("/:PID/comments")
  .post(protect, createComment)
  .get(protect, getAllComments);
router
  .route("/:PID/comments/:comment_id")
  .get(protect, getComment)
  .patch(protect, updateComment)
  .delete(protect, deleteCommment);

export default router;
