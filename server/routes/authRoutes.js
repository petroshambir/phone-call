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
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ስልክ ያስፈልጋል" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ሀ. ተጠቃሚውን ዳታቤዝ ውስጥ ማስቀመጥ (ይህ መጀመሪያ ይከናወናል)
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );
    console.log(`✅ ዳታቤዝ ተሳክቷል። OTP: ${otp}`);

    // ለ. 🔑 ቁልፍ ለውጥ፦ ኢሜይሉን 'await' አናደርገውም!
    // ሰርቨሩ ኢሜይሉ እስኪላክ ሳይጠብቅ ወዲያውኑ ለተጠቃሚው ምላሽ ይሰጣል።
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "የምዝገባ ኮድ (OTP)",
        text: `የእርስዎ ማረጋገጫ ኮድ፡ ${otp}`,
      })
      .then(() => console.log("📧 ኢሜይል ተልኳል"))
      .catch((err) =>
        console.log("⚠️ የኢሜይል ግንኙነት ተቋርጧል (Timeout):", err.message)
      );

    // ሐ. ወዲያውኑ ለ Front-end ስኬታማ ምላሽ መስጠት
    return res.status(200).json({
      success: true,
      message: "በተሳካ ሁኔታ ተመዝግበዋል። OTP በኢሜይል ተልኳል።",
      debugOtp: otp, // ኢሜይሉ ባይመጣ እንኳ እዚህ ጋር አይተህ መግባት ትችላለህ
    });
  } catch (error) {
    console.error("❌ የዳታቤዝ ስህተት:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "የሰርቨር ስህተት አጋጥሟል" });
    }
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
