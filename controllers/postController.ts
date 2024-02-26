import { RequestHandler, Request } from "express";
import AsyncHandler from "../utils/asyncHandler";
import Post from "../models/postModel";
import AppError from "../utils/appError";
import multer from "multer";
import sharp from "sharp";
import { generateRandomPostID } from "../utils/misc";

interface CustomRequest extends Request {
  currentUser?: any;
}

// Handle Image upoloads
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

export const uploadPostImage = upload.single("image");

export const resizePostImage: RequestHandler = async (
  req: CustomRequest,
  res,
  Next
) => {
  req.body.image = `img-blog-${req.currentUser.id}-${Date.now()}-post.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/images/posts/${req.body.image}`);
  }
  Next();
};

// Create a blog post
export const createBlogPost: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { title, content, tags, category, image } = req.body;

    const { currentUser } = req;
    if (!currentUser)
      throw new AppError(
        "You are not authorized to perform this action, please sign in",
        401
      );

    const newPost = new Post({
      title,
      content,
      image,
      author: currentUser.id,
      tags,
      category,
      PID: generateRandomPostID(),
    });

    await newPost.save();

    res.status(201).json({
      status: "success",
      data: {
        data: newPost,
      },
    });
  }
);

// Get all blog posts
export const getAllBlogPosts: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const allPosts = await Post.find().populate(
      "author",
      "name email username"
    );

    res.status(200).json({
      status: "success",
      results: allPosts.length,
      data: {
        data: allPosts,
      },
    });
  }
);

// Get a single blog post
export const getBlogPost: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { PID } = req.params;

    const blogPost = await Post.findOne({ PID }).populate(
      "author",
      "name email username"
    );

    if (!blogPost) throw new AppError("Not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        data: blogPost,
      },
    });
  }
);

// Update a blog post
export const updateBlogPost: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { PID } = req.params;
    const { title, content, tags, category, image } = req.body;

    const { currentUser } = req;

    const blogPost = await Post.findOne({ PID });
    if (!blogPost) throw new AppError("Blog post does not exist", 404);

    if (currentUser.id !== blogPost.author.toString())
      throw new AppError("You are not authorized to perform this action ", 401);

    const updatedBlogPost = await Post.findOneAndUpdate(
      { PID },
      { title, content, tags, category, image },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        data: updatedBlogPost,
      },
    });
  }
);

// Delete a blog post
export const deleteBlogPost: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { PID } = req.params;
    const { currentUser } = req;

    const blogPost = await Post.findOne({ PID });

    if (!blogPost) throw new AppError("Blog post does not exist", 404);

    if (currentUser.id !== blogPost.author.toString())
      throw new AppError("You are not authorized to perform this action.", 401);

    const deleteBlogPost = await Post.findOneAndDelete({
      PID,
      author: { id: currentUser.id },
    });

    res.status(204).json({
      status: "success",
    });
  }
);

// Toggle like post
export const ToggleLikePost: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { PID } = req.params;

    const { currentUser } = req;

    const blogPost = await Post.findOne({ PID });
    if (!blogPost) throw new AppError("Post not found", 404);

    const isLiked = blogPost.likes.indexOf(currentUser.id);

    if (isLiked === -1) {
      blogPost.likes.push(currentUser.id);
      await blogPost.save();

      currentUser.favorites.push(blogPost.id);
      await currentUser.save();
    } else {
      blogPost.likes.splice(isLiked, 1);
      await blogPost.save();

      currentUser.favorites.splice(
        currentUser.favorites.indexOf(blogPost.id),
        1
      );
      await currentUser.save();
    }

    res.status(200).json({
      status: "success",
      data: {
        data: blogPost,
      },
    });
  }
);

// Get posts by author
export const getBlogPostsByAuthor: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { author_id } = req.params;

    const blogPosts = await Post.find({ author: author_id });
    if (!blogPosts) throw new AppError("User not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        data: blogPosts,
      },
    });
  }
);

// Get posts by category
export const getBlogPostsByCategory: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { category_id } = req.params;

    const blogPost = await Post.findOne({ category: category_id });
    if (!blogPost) throw new AppError("Blog post not found", 404);

    res.status(200).json({
      status: "succcess",
      data: {
        data: blogPost,
      },
    });
  }
);

// Mark post as viewed/read
export const AddRead: RequestHandler = AsyncHandler(async (req, res, next) => {
  const { PID } = req.params;

  const blogPost = await Post.findOne({ PID });
  if (!blogPost) throw new AppError("Post not found", 404);

  blogPost.reads += 1;
  await blogPost.save();

  res.status(200).json({
    status: "success",
    message: "Post has been marked as read",
  });
});

// FIND OUT HOW TO LIST FULL RESOURCE AND IDS
