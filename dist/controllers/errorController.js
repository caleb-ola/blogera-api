"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new appError_1.default(message, 400);
};
const handleDuplicateValue = () => {
    const message = "Duplicate value";
    return new appError_1.default(message, 400);
};
const handleValidationErrors = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data ${errors.join(". ")}`;
    return new appError_1.default(message, 400);
};
const handleJWTError = () => new appError_1.default("Invalid token, please log in again.", 401);
const handleTokenExpError = () => new appError_1.default("Expired token, please log in again.", 401);
const sendErrorProd = (err, req, res) => {
    // API
    // if (req.originalUrl.startsWith("/api")) {
    if ((err === null || err === void 0 ? void 0 : err.isOperational) === true) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        console.log("Error: " + err);
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }
    // }
    // // RENDERED WEBSITE
    // else {
    //   if (err?.isOperational === true) {
    //     return res.status(err.statusCode).render("error", {
    //       title: "Something went wrong",
    //       msg: err.message,
    //     });
    //   } else {
    //     return res.status(err.statusCode).render("error", {
    //       title: "Something went wrong",
    //       msg: "Please try again later",
    //     });
    //   }
    // }
};
const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    else {
        // RENDERED WEBSITE FOR ERROR MESSAGE IN DEVELOPMENT ENVIRONMENT
        console.log("Error: " + err);
        res.status(err.statusCode).render("error", {
            title: "Something went wrong",
            msg: err.message,
        });
    }
};
const GlobalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "production") {
        let error;
        if (err.name === "CastError")
            error = handleCastErrorDB(err, req, res, next);
        if (err.code === 11000)
            error = handleDuplicateValue(err, req, res, next);
        if (err.name === "ValidationError")
            error = handleValidationErrors(err, req, res, next);
        if (err.name === "JsonWebTokenError")
            error = handleJWTError(err, req, res, next);
        if (err.name === "TokenExpiredError")
            error = handleTokenExpError(err, req, res, next);
        sendErrorProd(error || err, req, res, next);
    }
    else if (process.env.NODE_ENV === "development") {
        let error;
        if (err.name === "CastError")
            error = handleCastErrorDB(err, req, res, next);
        if (err.code === 11000)
            error = handleDuplicateValue(err, req, res, next);
        if (err.name === "ValidationError")
            error = handleValidationErrors(err, req, res, next);
        if (err.name === "JsonWebTokenError")
            error = handleJWTError(err, req, res, next);
        if (err.name === "TokenExpiredError")
            error = handleTokenExpError(err, req, res, next);
        sendErrorDev(error || err, req, res, next);
    }
    next();
};
exports.default = GlobalErrorHandler;
