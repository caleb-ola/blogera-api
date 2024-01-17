import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

interface CustomRequest extends Request {
  currentUser?: any;
}

const restrictTo = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.currentUser.role)) {
      throw new AppError("You are not authorised to perform this action", 401);
    }
    next();
  };
};

export default restrictTo;
