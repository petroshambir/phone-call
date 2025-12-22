import express from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";

const router = express.Router();

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. OTP መላኪያ
router.post("/register-send-otp", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone)
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ስልክ ያስፈልጋል" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate(
      { email },
      { email, phone, otp, isVerified: false },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "የማረጋገጫ ኮድ - Habesha Tel",
      html: `<div style="font-family: Arial; padding: 20px;">
              <h2>የማረጋገጫ ኮድዎ፡ ${otp}</h2>
            </div>`,
    });

    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("❌ AUTH_ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. OTP ማረጋገጫ
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (user && user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.status(200).json({ success: true, message: "ተሳክቷል" });
    }
    res.status(400).json({ success: false, message: "ኮዱ ተሳስቷል" });
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

export default router;
