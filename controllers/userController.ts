import { RequestHandler, Request } from "express";
import User from "../models/userModel";
import AsyncHandler from "../utils/asyncHandler";
import AppError from "../utils/appError";

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

    console.log({ updateObject });

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
