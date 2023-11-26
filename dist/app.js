"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const hpp_1 = __importDefault(require("hpp"));
// import xss from "xss-clean";
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./config.env" });
// import AppError from "./utils/appError";
const errorController_1 = __importDefault(require("./controllers/errorController"));
const appError_1 = __importDefault(require("./utils/appError"));
const router_1 = __importDefault(require("./routers/router"));
// GLOBAL MIDDLEWARES
const app = (0, express_1.default)();
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many request from this IP, please try again later",
});
app.use(limiter); // Rate limiting for IpP address
app.use((0, cors_1.default)());
app.use((0, hpp_1.default)()); // Prevent parameter pollution (duplicate query strings)
// app.use(xss()); // Data sanitation against xss
app.use((0, helmet_1.default)()); // Setting security/provisional headers
app.use((0, express_mongo_sanitize_1.default)());
// Parse Json data within incoming requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/v1/", router_1.default);
app.all("*", () => {
    throw new appError_1.default("Not found", 404);
});
app.use(errorController_1.default);
exports.default = app;
