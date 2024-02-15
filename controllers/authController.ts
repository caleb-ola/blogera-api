import { Request, RequestHandler, Response } from "express";
import AsyncHandler from "../utils/asyncHandler";
import config from "../config";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import User from "../models/userModel";
import AppError from "../utils/appError";
import Email from "../utils/email";
import crypto from "crypto";
import { compare } from "bcryptjs";
import generateRandomUsername from "../utils/randomStringGen";

interface CustomRequest extends Request {
  currentUser?: any;
}

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

// SIGNUP A NEW USER AND SEND CONFIRMATION TO THEIR EMAIL
export const signUp: RequestHandler = AsyncHandler(async (req, res, next) => {
  // Collect user data
  const { name, email, password, confirmPassword } = req.body;

  //  Check if user exists and User email is verified
  const existingUser = await User.findOne({ email });

  if (existingUser)
    throw new AppError(
      "User email already exists, please use another email",
      400
    );

  // Collect User Data
  const newUser = new User({
    name,
    email,
    password,
    confirmPassword,
    role: "user",
    username: generateRandomUsername(
      name.toLowerCase().replace(/\s/g, "_"),
      12
    ),
  });

  // Generate verification token
  const verificationToken = newUser.createVerificationToken();

  // Save User Data
  await newUser.save({ validateBeforeSave: false });

  // Send email to user
  const url = `${req.protocol}://${req.get(
    "host"
  )}/auth/email-verification/${verificationToken}`;

  await new Email(newUser, url).sendEmailVerification();

  res.status(201).json({
    status: "success",
    message: "We sent a confirmation code to your email address",
  });
});

// VERIFY USER EMAIL AND LOG THEM IN
export const verifyUserEmail: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { token } = req.body;

    // Check if there is a token
    if (!token) throw new AppError("Please enter token", 400);

    // Hash the token
    const verificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Check if user is verified and if a user with token exists and if token has expired
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpires: { $gte: Date.now() },
    });

    if (!user)
      throw new AppError(
        "Sorry, We are unable to find a user with this token. Token may have expired",
        400
      );
    if (user.isVerified) throw new AppError("Email is already verified", 400);

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    // Send email to user
    const url = `${req.protocol}://${req.get(
      "host"
    )}/auth/email-verification/${verificationToken}`;

    await new Email(user, url).sendWelcomeMail();
    createSendToken(user, 200, res);
  }
);

// RESEND VERIFICATION TOKEN
export const resendVerifyUserEmail: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new AppError("Please enter email", 400);

    // Check if a user with the email exists
    const existingUser = await User.findOne({ email }).select("+active");
    if (!existingUser) throw new AppError("User not found", 400);
    if (existingUser.isVerified)
      throw new AppError(
        "User is already verified, please proceed to login",
        400
      );
    if (!existingUser.active)
      throw new AppError(
        "Account has been suspended, kindly reach out to support",
        400
      );

    // Create Verification Token
    const verificationToken = existingUser.createVerificationToken();

    // Save User Data
    await existingUser.save();

    // Send email to the user
    const url = `${req.protocol}://${req.get(
      "host"
    )}/auth/email-verification/${verificationToken}`;

    await new Email(existingUser, url).sendEmailVerification();

    res.status(200).json({
      status: "success",
      message: "We sent a confirmation code to your email address",
    });
  }
);

// SIGNIN AN EXISITING USER
export const login: RequestHandler = AsyncHandler(async (req, res, next) => {
  // Get email and password from user request body
  const { email, password } = req.body;

  if (!email) throw new AppError("Please enter email", 400);
  if (!password) throw new AppError("Please enter password", 400);

  // Check if user exists
  const existingUser = await User.findOne({ email }).select(
    "+password +active"
  );

  if (!existingUser) throw new AppError("Email or Password incorrect", 400);
  if (!existingUser.isVerified)
    throw new AppError(
      "We sent a verification to your email, please verify your email or proceed to resend verification ",
      400
    );
  if (!existingUser.active)
    throw new AppError(
      "Your email has been deactivated, please contact support",
      400
    );

  // CHECK IF PASSWORD IS CORRECT
  const comparePasswords = await existingUser.checkPassword(
    password,
    existingUser.password
  );

  if (!comparePasswords) throw new AppError("Email or Password incorrect", 400);

  await new Email(existingUser, "").sendLoginSuccess();

  createSendToken(existingUser, 200, res);
});

// FORGOT PASSWORD
export const forgotPassword: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new AppError("Please enter email", 400);

    // Check if user with email exists
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      throw new AppError("User with email does not exisit", 400);

    // Create password reset token
    const resetToken = await existingUser.createPasswordResetToken();
    await existingUser.save({ validateBeforeSave: false });

    // Create URL
    const url = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;

    // Send forgot password email
    await new Email(existingUser, url).sendForgotPassword();

    res.status(200).json({
      status: "success",
      message: "We sent a password reset token to your email address",
    });
  }
);

// RESET PASSWORD AFTER FORGOT
export const resetPassword: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const { token, password, confirmPassword } = req.body;
    if (!token) throw new AppError("Please enter token", 400);
    if (!password) throw new AppError("Please enter password", 400);
    if (!confirmPassword)
      throw new AppError("Please enter confirmPassword", 400);

    // Check if password and confirmPassword are a match
    if (password !== confirmPassword)
      throw new AppError("Password and Confirm Password do not match.", 400);

    // Get user by token
    const verifiedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: verifiedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    console.log({ user });

    if (!user)
      throw new AppError("Token invalid. Token may have expired.", 400);

    user.password = password;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send Email
    await new Email(
      user,
      `${config.APP_URL}/auth/login`
    ).sendResetPasswordSuccess();

    createSendToken(user, 200, res);
  }
);

// CHANGE PASSWORD
export const updatePassword: RequestHandler = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { password, newPassword, confirmNewPassword } = req.body;

    if (!password) throw new AppError("Please enter password", 400);
    if (!newPassword) throw new AppError("Please enter new password", 400);
    if (!confirmNewPassword)
      throw new AppError("Please enter confrim new password", 400);

    if (newPassword !== confirmNewPassword)
      throw new AppError(
        "New Password and Confirm New Password do not match",
        400
      );
    const { currentUser } = req;
    if (!currentUser)
      throw new AppError("Invalid token, please login again", 400);

    const user = await User.findById(req.currentUser.id).select("+password");
    if (!user) throw new AppError("Invalid token, please login again", 400);

    const correctPassword = await user.checkPassword(password, user.password);
    if (!correctPassword) throw new AppError("Password is incorrect", 403);

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    createSendToken(user, 200, res);
  }
);

export const sendTestEmail: RequestHandler = AsyncHandler(
  async (req, res, next) => {
    const user = {
      name: "Olopa User2",
      email: "dolabomitest@gmail.com",
      username: "olopaUser2",
      role: "user",
      slug: "olopa-user2",
    };

    // await new Email(user, "www.test.com").sendWelcomeMail();
    // await new Email(user, "www.test.com").sendForgotPassword();
    // await new Email(user, "www.test.com").sendResetPasswordSuccess();

    res.status(200).json({
      message: "A test email has been sent successfully",
    });
  }
);
