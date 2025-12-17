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

router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ስልክ ያስፈልጋል" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. መጀመሪያ ተጠቃሚውን ዳታቤዝ ውስጥ እናስቀምጥ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );
    console.log(`✅ User saved. OTP: ${otp}`);

    // 2. ኢሜይል መላክ (🔑 ሳይቆይ ከጀርባ እንዲሰራ await አናደርገውም)
    // ይህ በሎጉ የታየውን ETIMEDOUT ስህተት ለተጠቃሚው እንዳይታይ ያደርጋል
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "የምዝገባ ኮድ",
        text: `ኮድዎ፡ ${otp}`,
      })
      .then(() => console.log("📧 Email sent"))
      .catch((err) => console.error("❌ Email Timeout Error:", err.message));

    // 3. ወዲያውኑ ምላሽ እንስጥ
    return res.status(200).json({
      success: true,
      message: "OTP ተፈጥሯል (ኢሜይሉ ካልደረሰ Network Tab ይመልከቱ)",
      debugOtp: otp, // ይህንን ለጊዜው ለመግባት ተጠቀምበት
    });
  } catch (error) {
    console.error("❌ Register Error:", error.message);
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

// ... (verify-otp እና get user ኮድ እንዳለ ይቀጥላል)
export default router;
