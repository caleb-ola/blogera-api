"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: "./config.env" });
const Config = () => {
    return {
        DATABASE: process.env.DATABASE,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
        PORT: +process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        APP_NAME: process.env.APP_NAME,
        APP_EMAIL_FROM: process.env.APP_EMAIL_FROM,
        APP_URL: process.env.APP_URL,
        // APP_SERVER_URL: process.env.APP_SERVER_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        EMAIL_USERNAME: process.env.EMAIL_USERNAME,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
        EMAIL_PORT: +process.env.EMAIL_PORT,
        EMAIL_HOST: process.env.EMAIL_HOST,
        BREVO_HOST: process.env.BREVO_HOST,
        BREVO_PORT: +process.env.BREVO_PORT,
        BREVO_USERNAME: process.env.BREVO_USERNAME,
        BREVO_PASSWORD: process.env.BREVO_PASSWORD,
        BREVO_KEY: process.env.BREVO_KEY,
    };
};
const sanitizeConfig = (config) => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config.env`);
        }
    }
    return config;
};
const config = sanitizeConfig(Config());
exports.default = config;
