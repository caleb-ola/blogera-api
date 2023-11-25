import { RequestHandler, Response } from "express";
import AsyncHandler from "../utils/asyncHandler";
import config from "../config";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import User from "../models/userModel";
import AppError from "../utils/appError";

// GENERATE A TOKEN
const generateToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (
  user: any,
  statusCode: number,
  res: Response
) => {
  const token = generateToken(user.id, user.email);

  user.lastLogin = DateTime.now().toISO();
  await user.save();

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      data: user,
    },
  });
};

export const signUp: RequestHandler = AsyncHandler(async (req, res, next) => {
  // Collect user data
  const { name, email, username, password, confirmPassword } = req.body;

  //  Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return new AppError("User already exists", 400);

  //   Collect User Data
  const newUser = new User({
    name,
    email,
    username,
    password,
    confirmPassword,
    role: "user",
  });

  // Generate verification token
  const verifyToken = newUser.createVerificationToken();

  // Save User Data
  await newUser.save({ validateBeforeSave: false });

  //   Send email to user
});
