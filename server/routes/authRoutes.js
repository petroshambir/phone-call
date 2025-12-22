import express from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ZadarmaPackage = require("zadarma");

const router = express.Router();
const REQUIRED_MINUTES_PER_CALL = 1;

// 1. Zadarma Configuration (ኤረር እንዳይፈጥር ተስተካክሏል)
let api;
try {
  // Zadarma Constructor አጠራር ማስተካከያ
  const Zadarma = ZadarmaPackage.Zadarma || ZadarmaPackage;
  api = new Zadarma({
    key: process.env.ZADARMA_KEY,
    secret: process.env.ZADARMA_SECRET,
  });
  console.log("✅ Zadarma API Initialized Successfully");
} catch (error) {
  console.error("❌ Zadarma Initialization Error:", error.message);
  // እዚህ ጋር ሰርቨሩ እንዳይቆም api null ሆኖ ይቀጥላል
}

// 2. Nodemailer Configuration (ለ Render አስተማማኝው መንገድ)
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

  if (!email || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Phone are required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // 1. መጀመሪያ ዳታቤዝ ውስጥ ሴቭ እናድርግ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );
    console.log(`💾 User data saved for ${email}. Sending OTP...`);

    // 2. በመቀጠል ኢሜይሉን እንላክ
    const mailOptions = {
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: #2563eb;">Habesha Tel</h2>
                    <p>ሰላም፣ የምዝገባ ማረጋገጫ ኮድዎ ከታች ያለው ነው፡</p>
                    <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
                    <p>ይህ ኮድ ለ10 ደቂቃ ብቻ ያገለግላል።</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent successfully to ${email}`);

    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("❌ Registration/Email Error:", error);
    res.status(500).json({
      success: false,
      message: "ኢሜይል መላክ አልተቻለም",
      error: error.message,
    });
  }
});

// ... ሌሎቹ (verify-otp እና call-user) እንዳሉ ይቀጥላሉ
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
