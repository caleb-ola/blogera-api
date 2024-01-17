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
} from "../controllers/postController";
import protect from "../middlewares/protect";

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
router.get("/:username/author", getBlogPostsByAuthor);
router.patch("/:PID/toggle-like", protect, ToggleLikePost);
router.patch("/:PID/add-read", AddRead);

export default router;
