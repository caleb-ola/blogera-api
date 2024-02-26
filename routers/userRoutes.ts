import { Router } from "express";
import {
  deactivateCurrentUser,
  deactivateUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUser,
  getUserByEmail,
  getUserByUsername,
  resizeUserAvatar,
  resizeUserBannerImage,
  updateProfile,
  updateUserAvatar,
  updateUserBanner,
  uploadAvatar,
  uploadBanner,
} from "../controllers/userController";
import protect from "../middlewares/protect";
import restrictTo from "../middlewares/retrictTo";

const router = Router();

router.get("/", getAllUsers);
router.get("/user", getUserByEmail);
router.get("/current-user", protect, getCurrentUser);
router.get("/:id", getUser);
router.get("/username/:username", getUserByUsername);
router.patch("/update-profile", protect, updateProfile);
router.patch(
  "/update-user-avatar",
  protect,
  uploadAvatar,
  resizeUserAvatar,
  updateUserAvatar
);
router.patch(
  "/update-banner-image",
  protect,
  uploadBanner,
  resizeUserBannerImage,
  updateUserBanner
);
router.delete("/delete-current-user", protect, deactivateCurrentUser);
router.patch(
  "/deactivate-user/:email",
  protect,
  restrictTo("admin"),
  deactivateUser
);
router.delete("/delete-user/:email", protect, restrictTo("admin"), deleteUser);

export default router;
