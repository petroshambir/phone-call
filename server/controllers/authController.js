import User from "../models/userModel.js";
import nodemailer from "nodemailer";

// Nodemailer setup (Render-friendly ✅)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// 1. Register & Send OTP
export const registerSendOtpController = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይልና ስልክ ያስፈልጋል!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ተጠቃሚውን መፈለግ ወይም መፍጠር
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
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
              <h2>እንኳን ደህና መጡ!</h2>
              <p>የእርስዎ ማረጋገጫ ኮድ፡ <b style="font-size: 24px; color: #2563eb;">${otp}</b></p>
              <p>ይህ ኮድ ለ 10 ደቂቃ ብቻ ያገለግላል።</p>
             </div>`,
    });

    console.log(`✅ OTP (${otp}) sent to: ${email}`);
    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "ኢሜይል መላክ አልተቻለም፡ " + error.message });
  }
};

// 2. Verify OTP
export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይልና ኮድ ያስፈልጋል" });
    }

    const user = await User.findOne({ email });
    if (user && user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true, message: "ማረጋገጫ ተሳክቷል!" });
    }

    res.status(400).json({ success: false, message: "የተሳሳተ ኮድ አስገብተዋል" });
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
};
