import express from "express";
import {
  registerSendOtpController,
  verifyOtpController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register-send-otp", registerSendOtpController);
router.post("/verify-otp", verifyOtpController);

export default router;
