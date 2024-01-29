"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const protect_1 = __importDefault(require("../middlewares/protect"));
const router = (0, express_1.Router)();
router.post("/signup", authController_1.signUp);
router.post("/login", authController_1.login);
router.post("/email-verification", authController_1.verifyUserEmail);
router.post("/resend-email-verification", authController_1.resendVerifyUserEmail);
router.post("/forgot-password", authController_1.forgotPassword);
router.post("/reset-password", authController_1.resetPassword);
router.post("/update-password", protect_1.default, authController_1.updatePassword);
router.post("/test-email", authController_1.sendTestEmail);
exports.default = router;
