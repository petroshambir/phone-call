import express from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";

const router = express.Router();

// 1. Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 ሲሆን false መሆን አለበት
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password
  },
  tls: {
    rejectUnauthorized: false, // ለ Render ሰርቨር ወሳኝ ነው
  },
});

// --- 🟢 1. OTP መላኪያ ---
router.post("/register-send-otp", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ስልክ ያስፈልጋል" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. መጀመሪያ ዳታቤዝ ላይ ሴቭ እናድርግ
    await User.findOneAndUpdate(
      { email },
      { email, phone, otp, isVerified: false },
      { upsert: true, new: true }
    );

    // 2. ከዚያ ኢሜይል እንላክ
    const mailOptions = {
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "የማረጋገጫ ኮድ - Habesha Tel",
      html: `
          <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Habesha Tel</h2>
            <p>የማረጋገጫ ኮድዎ፡</p>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold;">
              ${otp}
            </div>
          </div>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP (${otp}) sent to: ${email}`);
    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("❌ AUTH_ERROR:", error.message);
    // ኤረሩ ለተጠቃሚው እንዲታይ (Debug ለማድረግ ይረዳል)
    res.status(500).json({ success: false, message: "ስህተት: " + error.message });
  }
});

// --- 🔵 2. OTP ማረጋገጫ ---
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
