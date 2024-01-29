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
exports.deleteUser = exports.deactivateUser = exports.deactivateCurrentUser = exports.updateProfile = exports.getUserByUsername = exports.getUserByEmail = exports.getUser = exports.getAllUsers = exports.getCurrentUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const appError_1 = __importDefault(require("../utils/appError"));
exports.getCurrentUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.currentUser;
    res.status(200).json({
        status: "success",
        data: {
            data: user,
        },
    });
}));
exports.getAllUsers = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.default.find();
    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            data: users,
        },
    });
}));
exports.getUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield userModel_1.default.findById(id);
    if (!user)
        throw new appError_1.default("User not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: user,
        },
    });
}));
exports.getUserByEmail = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (!user)
        throw new appError_1.default("User not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: user,
        },
    });
}));
exports.getUserByUsername = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const user = yield userModel_1.default.findOne({ username }).populate("favorites", "title");
    if (!user)
        throw new appError_1.default("Username not found", 404);
    res.status(200).json({
        status: "success",
        data: {
            data: user,
        },
    });
}));
exports.updateProfile = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get data from the request body
    const { name, username, bio, location, gender } = req.body;
    // Check if intending Username exists
    const existingUsername = yield userModel_1.default.findOne({ username });
    if (existingUsername)
        throw new appError_1.default("Username already exists, try another", 409);
    let updateObject = {};
    // Ensuring only values that are not empty gets updated
    const fieldsToUpdate = [
        "name",
        "username",
        "bio",
        "location",
        "gender",
    ];
    for (const field of fieldsToUpdate) {
        if (req.body[field] !== undefined &&
            req.body[field] !== null &&
            req.body[field] !== "") {
            updateObject[field] = req.body[field];
        }
    }
    console.log({ updateObject });
    // Get currentUser (coming from the protect middleware)
    const { currentUser } = req;
    const updatedUser = yield userModel_1.default.findByIdAndUpdate(currentUser.id, updateObject, {
        new: true,
    });
    res.status(201).json({
        status: "success",
        data: {
            data: updatedUser,
        },
    });
}));
exports.deactivateCurrentUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get current user (Coming from the protect middleware)
    const { currentUser } = req;
    if (!currentUser)
        throw new appError_1.default("You are not authorized to perform this action", 401);
    const user = yield userModel_1.default.findById(currentUser.id).select("+active");
    if (!user)
        throw new appError_1.default("User not found", 404);
    user.active = false;
    yield user.save();
    res.status(204).json({
        status: "success",
    });
}));
exports.deactivateUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    const user = yield userModel_1.default.findOne({ email }).select("+active");
    if (!user)
        throw new appError_1.default("User not found", 404);
    user.active = false;
    yield user.save();
    res.status(204).json({
        status: "success",
    });
}));
exports.deleteUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    if (!email)
        throw new appError_1.default("Please enter email", 400);
    yield userModel_1.default.findOneAndDelete({ email });
    res.status(204).json({
        status: "success",
    });
}));
