import { RequestHandler, Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import AsyncHandler from "../utils/asyncHandler";
import AppError from "../utils/appError";
import multer from "multer";
import sharp from "sharp";
import APIFeatures from "../utils/apiFeatures";
import config from "../config";
import AWS from "aws-sdk";
import { s3DeleteV2, s3UploadV2 } from "../services/s3CloudStorage";
import { extractFileNameFromUrl } from "../utils/casuals";

interface CustomRequest extends Request {
  currentUser?: any;
}

interface UpdateCurrentUserObject {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  gender?: string;
}

// setting up multer storage
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// SEtting up AWS s3 instance
const s3: any = new AWS.S3({
  accessKeyId: config.BUCKET_ACCESS,
  secretAccessKey: config.BUCKET_SECRET,
  region: config.BUCKET_REGION,
});

export const uploadAvatar = upload.single("avatar");
export const uploadBanner = upload.single("bannerImage");

// export const resizeUserAvatar = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   req.body.avatar = `img-avatar-${
//     req.currentUser.id
//   }-${Date.now()}-profile.jpeg`;
//   if (req.file) {
//     // console.log(req.file);
//     await sharp(req.file.buffer)
//       .resize(2000, 1333)
//       .toFormat("jpeg")
//       .jpeg({ quality: 90 })
//       .toFile(`public/images/users/avatars/${req.body.avatar}`);
//   }
//   next();
// };

// export const resizeUserBannerImage = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   req.body.bannerImage = `img-banner-${
//     req.currentUser.id
//   }-${Date.now()}-profile.jpeg`;
//   if (req.file) {
//     await sharp(req.file.buffer)
//       .resize(1584, 396)
//       .toFormat("jpeg")
//       .jpeg({ quality: 90 })
//       .toFile(`public/images/users/banners/${req.body.bannerImage}`);
//   }
//   next();
// };

export const getCurrentUser: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const user = req.currentUser;

    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  }
);

export const getAllUsers: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const users = await User.find();

    const features = new APIFeatures(users, req.query)
      .filter()
      .sort()
      .paginate()
      .limitFields();

    const userQuery = await features.query;

    res.status(200).json({
      status: "success",
      results: userQuery.length,
      data: {
        data: userQuery,
      },
    });
  }
);

export const getUser: RequestHandler = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

export const getUserByEmail: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  }
);

export const getUserByUsername: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { username } = req.params;

    const user = await User.findOne({ username }).populate(
      "favorites",
      "title"
    );
    if (!user) throw new AppError("Username not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  }
);

export const updateProfile: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    // Get data from the request body
    const { name, username, bio, location, gender } = req.body;

    // Check if intending Username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      throw new AppError("Username already exists, try another", 409);

    let updateObject: any = {};

    // Ensuring only values that are not empty gets updated
    const fieldsToUpdate: string[] = [
      "name",
      "username",
      "bio",
      "location",
      "gender",
    ];
    for (const field of fieldsToUpdate) {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ""
      ) {
        updateObject[field] = req.body[field];
      }
    }

    // console.log({ updateObject });

    // Get currentUser (coming from the protect middleware)
    const { currentUser } = req;
    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      updateObject,
      {
        new: true,
      }
    );

    res.status(201).json({
      status: "success",
      data: {
        data: updatedUser,
      },
    });
  }
);

export const deactivateCurrentUser: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    // Get current user (Coming from the protect middleware)
    const { currentUser } = req;
    if (!currentUser)
      throw new AppError("You are not authorized to perform this action", 401);

    const user = await User.findById(currentUser.id).select("+active");
    if (!user) throw new AppError("User not found", 404);

    user.active = false;
    await user.save();

    res.status(204).json({
      status: "success",
    });
  }
);

export const deactivateUser: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { email } = req.params;

    const user = await User.findOne({ email }).select("+active");
    if (!user) throw new AppError("User not found", 404);

    user.active = false;
    await user.save();

    res.status(204).json({
      status: "success",
    });
  }
);

export const deleteUser: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { email } = req.params;
    if (!email) throw new AppError("Please enter email", 400);

    await User.findOneAndDelete({ email });

    res.status(204).json({
      status: "success",
    });
  }
);

export const updateUserAvatar: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    // const { image } = req.body;
    // if (!image) throw new AppError("Avatar is required!", 400);

    const { currentUser } = req;
    if (!currentUser) throw new AppError("You are not logged in", 400);

    // if (currentUser.avatar) {
    //   const fileName = extractFileNameFromUrl(currentUser.avatar);
    //   console.log(fileName);
    //   const deleteUpload = await s3DeleteV2(fileName);
    //   console.log(deleteUpload);
    // }

    const result = await s3UploadV2(req, "avatars", currentUser?.avatar);
    // console.log({ result });

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      { avatar: result.Location },
      { new: true }
    );
    if (!updatedUser) throw new AppError("User not found!", 400);

    res.status(200).json({
      status: "success",
      data: {
        data: updatedUser,
      },
    });
  }
);

export const updateUserBanner: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    // const { bannerImage } = req.body;
    // if (!bannerImage) throw new AppError("Banner image is required", 400);

    const { currentUser } = req;
    if (!currentUser) throw new AppError("You are not logged in", 400);

    const result = await s3UploadV2(req, "banners", currentUser?.bannerImage);

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      { bannerImage: result.Location },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        data: updatedUser,
      },
    });
  }
);
