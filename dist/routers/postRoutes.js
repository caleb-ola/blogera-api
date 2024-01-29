"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const protect_1 = __importDefault(require("../middlewares/protect"));
const commentController_1 = require("../controllers/commentController");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(postController_1.getAllBlogPosts)
    .post(protect_1.default, postController_1.uploadPostImage, postController_1.resizePostImage, postController_1.createBlogPost);
router
    .route("/:PID")
    .get(postController_1.getBlogPost)
    .patch(protect_1.default, postController_1.uploadPostImage, postController_1.resizePostImage, postController_1.updateBlogPost)
    .delete(protect_1.default, postController_1.deleteBlogPost);
router.get("/:author_id/author", postController_1.getBlogPostsByAuthor);
router.get("/:category_id/category", postController_1.getBlogPostsByCategory);
router.patch("/:PID/toggle-like", protect_1.default, postController_1.ToggleLikePost);
router.patch("/:PID/add-read", postController_1.AddRead);
// COMMENTS
router
    .route("/:PID/comments")
    .post(protect_1.default, commentController_1.createComment)
    .get(protect_1.default, commentController_1.getAllComments);
router
    .route("/:PID/comments/:comment_id")
    .get(protect_1.default, commentController_1.getComment)
    .patch(protect_1.default, commentController_1.updateComment)
    .delete(protect_1.default, commentController_1.deleteCommment);
exports.default = router;
