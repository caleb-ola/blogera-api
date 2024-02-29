import multer from "multer";
import sharp from "sharp";
import AppError from "../utils/appError";
import { NextFunction, Request, Response } from "express";
import AsyncHandler from "../utils/asyncHandler";

interface CustomRequest extends Request {
  currentUser?: any;
}

const multerStorage = multer.memoryStorage();

const multerFilter: any = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image"))
    cb(new AppError("You are only allowed to upload an image", 400));

  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 10000000 }, // Limit size of 10mb for images (avatar and banner)
});

export const uploadImage = upload.single("image");

// Resizing the user avatar
export const resizeUserAvatar = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.file) {
    sharp(req.file.buffer).resize(2000, 1333);
  }
  next();
};

// Resizing the user's banner image
export const resizeUserBanner = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.file) {
    sharp(req.file.buffer).resize(1584, 396);
  }
  next();
};
