import express from "express";
import {
  createPrivacyForCurrentUserTemp,
  getUserPrivacy,
  updateStoryPrivacy,
} from "../controllers/privacy.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(authenticate, getUserPrivacy);
router.route("/story").put(authenticate, updateStoryPrivacy);

router.route("/temp").post(authenticate, createPrivacyForCurrentUserTemp);

export default router;