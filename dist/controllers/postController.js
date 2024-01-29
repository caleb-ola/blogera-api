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
exports.AddRead = exports.getBlogPostsByCategory = exports.getBlogPostsByAuthor = exports.ToggleLikePost = exports.deleteBlogPost = exports.updateBlogPost = exports.getBlogPost = exports.getAllBlogPosts = exports.createBlogPost = exports.resizePostImage = exports.uploadPostImage = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const postModel_1 = __importDefault(require("../models/postModel"));
const appError_1 = __importDefault(require("../utils/appError"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const misc_1 = require("../utils/misc");
// Handle Image upoloads
const multerStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: multerStorage });
exports.uploadPostImage = upload.single("image");
const resizePostImage = (req, res, Next) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.image = `img-blog-${req.currentUser.id}-${Date.now()}-post.jpeg`;
    if (req.file) {
        yield (0, sharp_1.default)(req.file.buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/images/posts/${req.body.image}`);
    }
    Next();
});
exports.resizePostImage = resizePostImage;
// Create a blog post
exports.createBlogPost = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, tags, category, image } = req.body;
    const { currentUser } = req;
    if (!currentUser)
        throw new appError_1.default("You are not authorized to perform this action, please sign in", 401);
    const newPost = new postModel_1.default({
        title,
        content,
        image,
        author: currentUser.id,
        tags,
        category,
        PID: (0, misc_1.generateRandomPostID)(),
    });
    yield newPost.save();
    res.status(201).json({
        status: "success",
        data: {
            data: newPost,
        },
    });
}));
// Get all blog posts
exports.getAllBlogPosts = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const allPosts = yield postModel_1.default.find().populate("author", "name email username");
    res.status(200).json({
        status: "success",
        results: allPosts.length,
        data: {
            data: allPosts,
        },
    });
}));
// Get a single blog post
exports.getBlogPost = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID } = req.params;
    const blogPost = yield postModel_1.default.findOne({ PID }).populate("author", "name email username");
    if (!blogPost)
        throw new appError_1.default("Not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: blogPost,
        },
    });
}));
// Update a blog post
exports.updateBlogPost = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID } = req.params;
    const { title, content, tags, category, image } = req.body;
    const { currentUser } = req;
    const blogPost = yield postModel_1.default.findOne({ PID });
    if (!blogPost)
        throw new appError_1.default("Blog post does not exist", 404);
    if (currentUser.id !== blogPost.author.toString())
        throw new appError_1.default("You are not authorized to perform this action ", 401);
    const updatedBlogPost = yield postModel_1.default.findOneAndUpdate({ PID }, { title, content, tags, category, image }, { new: true, runValidators: true });
    res.status(200).json({
        status: "success",
        data: {
            data: updatedBlogPost,
        },
    });
}));
// Delete a blog post
exports.deleteBlogPost = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID } = req.params;
    const { currentUser } = req;
    const blogPost = yield postModel_1.default.findOne({ PID });
    if (!blogPost)
        throw new appError_1.default("Blog post does not exist", 404);
    if (currentUser.id !== blogPost.author.toString())
        throw new appError_1.default("You are not authorized to perform this action.", 401);
    const deleteBlogPost = yield postModel_1.default.findOneAndDelete({
        PID,
        author: { id: currentUser.id },
    });
    res.status(204).json({
        status: "success",
    });
}));
// Toggle like post
exports.ToggleLikePost = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID } = req.params;
    const { currentUser } = req;
    const blogPost = yield postModel_1.default.findOne({ PID });
    if (!blogPost)
        throw new appError_1.default("Post not found", 404);
    const isLiked = blogPost.likes.indexOf(currentUser.id);
    if (isLiked === -1) {
        blogPost.likes.push(currentUser.id);
        yield blogPost.save();
        currentUser.favorites.push(blogPost.id);
        yield currentUser.save();
    }
    else {
        blogPost.likes.splice(isLiked, 1);
        yield blogPost.save();
        currentUser.favorites.splice(currentUser.favorites.indexOf(blogPost.id), 1);
        yield currentUser.save();
    }
    res.status(200).json({
        status: "success",
        data: {
            data: blogPost,
        },
    });
}));
// Get posts by author
exports.getBlogPostsByAuthor = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { author_id } = req.params;
    const blogPosts = yield postModel_1.default.find({ author: author_id });
    if (!blogPosts)
        throw new appError_1.default("User not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: blogPosts,
        },
    });
}));
// Get posts by category
exports.getBlogPostsByCategory = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_id } = req.params;
    const blogPost = yield postModel_1.default.findOne({ category: category_id });
    if (!blogPost)
        throw new appError_1.default("Blog post not found", 404);
    res.status(200).json({
        status: "succcess",
        data: {
            data: blogPost,
        },
    });
}));
// Mark post as viewed/read
exports.AddRead = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { PID } = req.params;
    const blogPost = yield postModel_1.default.findOne({ PID });
    if (!blogPost)
        throw new appError_1.default("Post not found", 404);
    blogPost.reads += 1;
    yield blogPost.save();
    res.status(200).json({
        status: "success",
        message: "Post has been marked as read",
    });
}));
// FIND OUT HOW TO LIST FULL RESOURCE AND IDS
