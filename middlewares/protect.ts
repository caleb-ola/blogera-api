import jwt from "jsonwebtoken";
import { RequestHandler, Request, Response, NextFunction } from "express";
import AsyncHandler from "../utils/asyncHandler";
import AppError from "../utils/appError";
import { promisify } from "util";
import config from "../config";
import User from "../models/userModel";

interface JwtPayload {
  id: string;
  email: string;
  iat: number;
}

// Extend the Request interface to include a currentUser property
interface CustomRequest extends Request {
  currentUser?: any;
}

const protect: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //   1. Read token and check if token exists
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      throw new AppError("No authentication token", 400);
    }

    if (!token || token === null) {
      next(new AppError("You are not authorized, please login", 401));
    }

    //  Decode the token
    const decode = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    //   Check if user exists
    const user = await User.findById(decode.id).where({ active: true });
    if (!user)
      throw new AppError("User no longer exists, please login again", 401);

    // Check if user changed password after token was issued
    const passChanged = await user.changePasswordAfter(decode.iat);
    if (passChanged) {
      throw new AppError("Password changed by user. Please login again.", 401);
    }

    req.currentUser = user;
    next();
  }
);

export default protect;
