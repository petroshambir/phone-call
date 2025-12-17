import express from "express";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const router = express.Router();

// 1. Nodemailer Transporter ቅንብር
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 ሰከንድ ካለፈ ይቁም
});

// ------------------------------------
// 2. REGISTER & SEND OTP
// ------------------------------------
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. መጀመሪያ ዳታቤዝ ላይ ዳታውን አስቀምጥ (ይህ የግድ መሳካት አለበት)
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );
    console.log(`✅ ተጠቃሚ ዳታቤዝ ገብቷል። OTP: ${otp}`);

    // 2. 🔑 ቁልፍ መፍትሄ፡ 'await' አትጠቀም!
    // ኢሜይሉ ቢዘገይም ባይሳካም ሰርቨሩ ለተጠቃሚው ምላሽ መስጠቱን አይከለክልም
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP Verification",
        text: `የእርስዎ ኮድ: ${otp}`,
      })
      .catch((err) =>
        console.log(
          "⚠️ Email sending failed in background, but user is registered."
        )
      );

    // 3. ወዲያውኑ ለተጠቃሚው ስኬታማ ምላሽ ስጥ
    return res.status(200).json({
      success: true,
      message: "በተሳካ ሁኔታ ተመዝግበዋል!",
      debugOtp: otp, // ኢሜይሉ ባይመጣ እንኳ እዚህ ጋር አይተው መግባት ይችላሉ
    });
  } catch (error) {
    console.error("❌ ዳታቤዝ ስህተት:", error.message);
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

// ------------------------------------
// 3. VERIFY OTP
// ------------------------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ success: false, message: "ተጠቃሚው አልተገኘም" });

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true, message: "ማረጋገጫው ተሳክቷል!" });
    } else {
      return res.json({ success: false, message: "የተሳሳተ ኮድ ነው!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

// ------------------------------------
// 4. GET USER
// ------------------------------------
router.get("/user", async (req, res) => {
  try {
    const { phone } = req.query;
    const user = await User.findOne({ phone });
    if (!user)
      return res.status(404).json({ success: false, message: "ተጠቃሚ የለም" });
    res.json({
      success: true,
      user: {
        phone: user.phone,
        minutes: user.minutes || 0,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

export default router;
