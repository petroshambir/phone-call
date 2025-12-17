import express from "express";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
});

// ------------------------------------
// 2. REGISTER & SEND OTP
// ------------------------------------
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ስልክ ያስፈልጋል" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ሀ. መጀመሪያ ዳታቤዝ ላይ መመዝገቡን እናረጋግጥ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );

    // ለ. ኢሜይል መላክ (🔑 ሳይቆይ ከጀርባ እንዲሰራ await አናደርገውም)
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "የምዝገባ ኮድ",
        text: `ኮድዎ፡ ${otp}`,
      })
      .catch((err) => console.log("Email Error ignored for now:", err.message));

    // ሐ. ወዲያውኑ ምላሽ እንስጥ (ይህ 500 Errorን ይከላከላል)
    return res.status(200).json({
      success: true,
      message: "OTP ተፈጥሯል",
      debugOtp: otp,
    });
  } catch (error) {
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
    if (!user) return res.json({ success: false, message: "ተጠቃሚው የለም" });

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true, message: "ተሳክቷል!" });
    } else {
      return res.json({ success: false, message: "የተሳሳተ ኮድ!" });
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
    if (!user) return res.status(404).json({ success: false, message: "የለም" });
    res.json({
      success: true,
      user: { phone: user.phone, minutes: user.minutes || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

export default router;
