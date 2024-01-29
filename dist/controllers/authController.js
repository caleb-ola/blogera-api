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
exports.sendTestEmail = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.resendVerifyUserEmail = exports.verifyUserEmail = exports.signUp = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const luxon_1 = require("luxon");
const userModel_1 = __importDefault(require("../models/userModel"));
const appError_1 = __importDefault(require("../utils/appError"));
const email_1 = __importDefault(require("../utils/email"));
const crypto_1 = __importDefault(require("crypto"));
const randomStringGen_1 = __importDefault(require("../utils/randomStringGen"));
// GENERATE A TOKEN
const generateToken = (id, email) => {
    return jsonwebtoken_1.default.sign({ id, email }, config_1.default.JWT_SECRET, {
        expiresIn: config_1.default.JWT_EXPIRES_IN,
    });
};
const createSendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = generateToken(user.id, user.email);
    user.lastLogin = luxon_1.DateTime.now().toISO();
    yield user.save();
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            data: user,
        },
    });
});
// SIGNUP A NEW USER AND SEND CONFIRMATION TO THEIR EMAIL
exports.signUp = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Collect user data
    const { name, email, password, confirmPassword } = req.body;
    //  Check if user exists and User email is verified
    const existingUser = yield userModel_1.default.findOne({ email });
    if (existingUser)
        throw new appError_1.default("User email already exists, please use another email", 400);
    // Collect User Data
    const newUser = new userModel_1.default({
        name,
        email,
        password,
        confirmPassword,
        role: "user",
        username: (0, randomStringGen_1.default)(name.toLowerCase().replace(/\s/g, "_"), 12),
    });
    // Generate verification token
    const verificationToken = newUser.createVerificationToken();
    // Save User Data
    yield newUser.save({ validateBeforeSave: false });
    // Send email to user
    const url = `${req.protocol}://${req.get("host")}/auth/email-verification/${verificationToken}`;
    yield new email_1.default(newUser, url).sendEmailVerification();
    res.status(201).json({
        status: "success",
        message: "We sent a confirmation code to your email address",
    });
}));
// VERIFY USER EMAIL AND LOG THEM IN
exports.verifyUserEmail = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    // Check if there is a token
    if (!token)
        throw new appError_1.default("Please enter token", 400);
    // Hash the token
    const verificationToken = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    // Check if user is verified and if a user with token exists and if token has expired
    const user = yield userModel_1.default.findOne({
        verificationToken,
        verificationTokenExpires: { $gte: Date.now() },
    });
    if (!user)
        throw new appError_1.default("Sorry, We are unable to find a user with this token. Token may have expired", 400);
    if (user.isVerified)
        throw new appError_1.default("Email is already verified", 400);
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    yield user.save({ validateBeforeSave: false });
    // Send email to user
    const url = `${req.protocol}://${req.get("host")}/auth/email-verification/${verificationToken}`;
    yield new email_1.default(user, url).sendWelcomeMail();
    createSendToken(user, 200, res);
}));
// RESEND VERIFICATION TOKEN
exports.resendVerifyUserEmail = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email)
        throw new appError_1.default("Please enter email", 400);
    // Check if a user with the email exists
    const existingUser = yield userModel_1.default.findOne({ email }).select("+active");
    if (!existingUser)
        throw new appError_1.default("User not found", 400);
    if (existingUser.isVerified)
        throw new appError_1.default("User is already verified, please proceed to login", 400);
    if (!existingUser.active)
        throw new appError_1.default("Account has been suspended, kindly reach out to support", 400);
    // Create Verification Token
    const verificationToken = existingUser.createVerificationToken();
    // Save User Data
    yield existingUser.save();
    // Send email to the user
    const url = `${req.protocol}://${req.get("host")}/auth/email-verification/${verificationToken}`;
    yield new email_1.default(existingUser, url).sendEmailVerification();
    res.status(200).json({
        status: "success",
        message: "We sent a confirmation code to your email address",
    });
}));
// SIGNIN AN EXISITING USER
exports.login = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get email and password from user request body
    const { email, password } = req.body;
    if (!email)
        throw new appError_1.default("Please enter email", 400);
    if (!password)
        throw new appError_1.default("Please enter password", 400);
    // Check if user exists
    const existingUser = yield userModel_1.default.findOne({ email }).select("+password +active");
    if (!existingUser)
        throw new appError_1.default("Email or Password incorrect", 400);
    if (!existingUser.isVerified)
        throw new appError_1.default("We sent a verification to your email, please verify your email or proceed to resend verification ", 400);
    if (!existingUser.active)
        throw new appError_1.default("Your email has been deactivated, please contact support", 400);
    // CHECK IF PASSWORD IS CORRECT
    const comparePasswords = yield existingUser.checkPassword(password, existingUser.password);
    if (!comparePasswords)
        throw new appError_1.default("Email or Password incorrect", 400);
    createSendToken(existingUser, 200, res);
}));
// FORGOT PASSWORD
exports.forgotPassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email)
        throw new appError_1.default("Please enter email", 400);
    // Check if user with email exists
    const existingUser = yield userModel_1.default.findOne({ email });
    if (!existingUser)
        throw new appError_1.default("User with email does not exisit", 400);
    // Create password reset token
    const resetToken = yield existingUser.createPasswordResetToken();
    yield existingUser.save({ validateBeforeSave: false });
    // Create URL
    const url = `${req.protocol}://${req.get("host")}/auth/reset-password/${resetToken}`;
    // Send forgot password email
    yield new email_1.default(existingUser, url).sendForgotPassword();
    res.status(200).json({
        status: "success",
        message: "We sent a password reset token to your email address",
    });
}));
// RESET PASSWORD AFTER FORGOT
exports.resetPassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password, confirmPassword } = req.body;
    if (!token)
        throw new appError_1.default("Please enter token", 400);
    if (!password)
        throw new appError_1.default("Please enter password", 400);
    if (!confirmPassword)
        throw new appError_1.default("Please enter confirmPassword", 400);
    // Check if password and confirmPassword are a match
    if (password !== confirmPassword)
        throw new appError_1.default("Password and Confirm Password do not match.", 400);
    // Get user by token
    const verifiedToken = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = yield userModel_1.default.findOne({
        passwordResetToken: verifiedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    console.log({ user });
    if (!user)
        throw new appError_1.default("Token invalid. Token may have expired.", 400);
    user.password = password;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    yield user.save();
    // Send Email
    yield new email_1.default(user, `${config_1.default.APP_URL}/auth/login`).sendResetPasswordSuccess();
    createSendToken(user, 200, res);
}));
// CHANGE PASSWORD
exports.updatePassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, newPassword, confirmNewPassword } = req.body;
    if (!password)
        throw new appError_1.default("Please enter password", 400);
    if (!newPassword)
        throw new appError_1.default("Please enter new password", 400);
    if (!confirmNewPassword)
        throw new appError_1.default("Please enter confrim new password", 400);
    if (newPassword !== confirmNewPassword)
        throw new appError_1.default("New Password and Confirm New Password do not match", 400);
    const { currentUser } = req;
    if (!currentUser)
        throw new appError_1.default("Invalid token, please login again", 400);
    const user = yield userModel_1.default.findById(req.currentUser.id).select("+password");
    if (!user)
        throw new appError_1.default("Invalid token, please login again", 400);
    const correctPassword = yield user.checkPassword(password, user.password);
    if (!correctPassword)
        throw new appError_1.default("Password is incorrect", 403);
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    yield user.save();
    createSendToken(user, 200, res);
}));
exports.sendTestEmail = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
