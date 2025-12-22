import express from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";

const router = express.Router();

// 1. Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password
  },
});

// --- OTP መላኪያ ---
router.post("/register-send-otp", async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone)
    return res.status(400).json({ success: false, message: "መረጃው አልተሟላም" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // ዳታቤዝ ማደስ
    await User.findOneAndUpdate(
      { email },
      { email, phone, otp, isVerified: false },
      { upsert: true, new: true }
    );

    // ኢሜይል መላክ
    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "የምዝገባ ኮድዎ",
      html: `<b>የምዝገባ ኮድዎ: <span style="font-size: 20px; color: blue;">${otp}</span></b>`,
    });

    console.log(`✅ OTP sent to: ${email}`);
    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ success: false, message: "ኢሜይል መላክ አልተቻለም" });
  }
});

// --- OTP ማረጋገጫ ---
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: "የተሳሳተ ኮድ" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
