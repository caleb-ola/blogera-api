import { RequestHandler } from "express";
import User from "../models/userModel";
import AsyncHandler from "../utils/asyncHandler";

export const getAllUsers: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        data: users,
      },
    });
  }
);
