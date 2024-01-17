import { ErrorRequestHandler, RequestHandler } from "express";
import AppError from "../utils/appError";

const handleCastErrorDB: ErrorRequestHandler = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateValue: ErrorRequestHandler = () => {
  const message = "Duplicate value";
  return new AppError(message, 400);
};

const handleValidationErrors: ErrorRequestHandler = (err) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJWTError: ErrorRequestHandler = () =>
  new AppError("Invalid token, please log in again.", 401);

const handleTokenExpError: ErrorRequestHandler = () =>
  new AppError("Expired token, please log in again.", 401);

const sendErrorProd: ErrorRequestHandler = (err, req, res) => {
  // API
  // if (req.originalUrl.startsWith("/api")) {
  if (err?.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
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
const sendErrorDev: ErrorRequestHandler = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE FOR ERROR MESSAGE IN DEVELOPMENT ENVIRONMENT
    console.log("Error: " + err);
    res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
};

const GlobalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    let error: any;
    if (err.name === "CastError")
      error = handleCastErrorDB(err, req, res, next);
    if (err.code === 11000) error = handleDuplicateValue(err, req, res, next);
    if (err.name === "ValidationError")
      error = handleValidationErrors(err, req, res, next);
    if (err.name === "JsonWebTokenError")
      error = handleJWTError(err, req, res, next);
    if (err.name === "TokenExpiredError")
      error = handleTokenExpError(err, req, res, next);
    sendErrorProd(error || err, req, res, next);
  } else if (process.env.NODE_ENV === "development") {
    let error: any;
    if (err.name === "CastError")
      error = handleCastErrorDB(err, req, res, next);
    if (err.code === 11000) error = handleDuplicateValue(err, req, res, next);
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

export default GlobalErrorHandler;
