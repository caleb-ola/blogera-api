import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
// import xss from "xss-clean";
import MongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

// import AppError from "./utils/appError";
import GlobalErrorHandler from "./controllers/errorController";
import AppError from "./utils/appError";

import routers from "./routers/router";
// GLOBAL MIDDLEWARES
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many request from this IP, please try again later",
});

app.use(limiter); // Rate limiting for IPP address
app.use(cors());
app.use(hpp()); // Prevent parameter pollution (duplicate query strings)
// app.use(xss()); // Data sanitation against xss
app.use(helmet()); // Setting security/provisional headers
app.use(MongoSanitize());

// Parse Json data within incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/", routers);

app.all("*", () => {
  throw new AppError("Not found", 404);
});

app.use(GlobalErrorHandler);

export default app;

// "start": "node ./dist/index.js",
//     "dev": "nodemon --exec ts-node ./index.ts"
