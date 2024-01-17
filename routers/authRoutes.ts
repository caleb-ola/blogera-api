import { Router } from "express";
import {
  forgotPassword,
  login,
  resendVerifyUserEmail,
  resetPassword,
  sendTestEmail,
  signUp,
  updatePassword,
  verifyUserEmail,
} from "../controllers/authController";
import protect from "../middlewares/protect";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/email-verification", verifyUserEmail);
router.post("/resend-email-verification", resendVerifyUserEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", protect, updatePassword);
router.post("/test-email", sendTestEmail);

export default router;
