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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const appError_1 = __importDefault(require("../utils/appError"));
const config_1 = __importDefault(require("../config"));
const userModel_1 = __importDefault(require("../models/userModel"));
const protect = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //   1. Read token and check if token exists
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else {
        throw new appError_1.default("No authentication token", 400);
    }
    if (!token || token === null) {
        next(new appError_1.default("You are not authorized, please login", 401));
    }
    //  Decode the token
    const decode = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
    //   Check if user exists
    const user = yield userModel_1.default.findById(decode.id).where({ active: true });
    if (!user)
        throw new appError_1.default("User no longer exists, please login again", 401);
    // Check if user changed password after token was issued
    const passChanged = yield user.changePasswordAfter(decode.iat);
    if (passChanged) {
        throw new appError_1.default("Password changed by user. Please login again.", 401);
    }
    req.currentUser = user;
    next();
}));
exports.default = protect;
