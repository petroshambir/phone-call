import express from "express";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const router = express.Router();

// 1. የኢሜይል መላኪያ (Nodemailer) ቅንብር
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

// ---------------------------------------------------------
// 2. ተጠቃሚ መመዝገቢያ እና OTP መላኪያ
// ---------------------------------------------------------
router.post("/register-send-otp", async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. ዳታቤዝ ላይ ማስቀመጥ (ይህ ተሳክቷል!)
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );

    // 2. ኢሜይሉን መላክ (ሳይቆይ ከጀርባ እንዲሰራ await አታድርገው)
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP",
        text: `Code: ${otp}`,
      })
      .catch((err) => console.log("Email Timeout (Ignored)"));

    // 3. 🔑 ወሳኝ፡ ለተጠቃሚው ወዲያውኑ 200 OK ምላሽ ስጥ
    return res.status(200).json({
      success: true,
      message: "OTP ተፈጥሯል",
      debugOtp: otp,
    });
  } catch (error) {
    // ዳታቤዝ ላይ ችግር ካለ ብቻ 500 ይላካል
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// 3. OTP ማረጋገጫ (Verify OTP)
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 4. የተጠቃሚ መረጃ ማግኛ (ደቂቃን ለማየት)
// ---------------------------------------------------------
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
