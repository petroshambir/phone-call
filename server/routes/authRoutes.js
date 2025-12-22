import express from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";

const router = express.Router();

// 1. Nodemailer Configuration (Gmail ተስተካክሏል)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password መሆኑን አረጋግጥ
  },
});

// --- OTP ROUTES ---
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;

  // 6 ዲጂት ኮድ ማመንጨት
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // 1. መረጃውን ዳታቤዝ ውስጥ ማስቀመጥ ወይም ማደስ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );

    // 2. ኢሜይሉን መላክ
    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "የምዝገባ ኮድዎ - Habesha Tel",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #2563eb;">Habesha Tel</h2>
          <p>እንኳን ደህና መጡ! የምዝገባ ኮድዎ ከታች ያለው ነው፡</p>
          <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px; color: #1e40af;">
            ${otp}
          </h1>
          <p>ይህ ኮድ ለ 10 ደቂቃ ብቻ ያገለግላል።</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to: ${email}`);
    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res
      .status(500)
      .json({ success: false, error: "ኢሜይል መላክ አልተቻለም፡ " + error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (user && user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: "የተሳሳተ ኮድ!" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
