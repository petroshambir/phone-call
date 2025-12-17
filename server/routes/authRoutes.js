import express from "express";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const router = express.Router();

// 1. Nodemailer Transporter ቅንብር
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // ለ 587 የግድ false መሆን አለበት
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password
  },
  // 🔑 ይህ ክፍል ለ Render በጣም ወሳኝ ነው
  tls: {
    rejectUnauthorized: false, // ሰርቲፊኬት ጥብቅነትን ያቃልላል
    minVersion: "TLSv1.2", // ደህንነቱ የተጠበቀ ግንኙነት ያረጋግጣል
  },
  connectionTimeout: 15000, // ጊዜውን ወደ 15 ሰከንድ ከፍ አድርገነዋል
  greetingTimeout: 10000, // ሰርቨሩ ሰላምታ እስኪለዋወጥ የሚጠበቅ ጊዜ
});
// ------------------------------------
// 2. REGISTER & SEND OTP
// ------------------------------------
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // ሀ. መጀመሪያ ዳታቤዝ ላይ ዳታውን አስቀምጥ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );
    console.log(`✅ DB Updated: ${otp}`);

    // ለ. 🔑 ወሳኝ፡ ለ Frontend ወዲያውኑ "Success" ምላሽ ስጥ!
    // ይህ ዌብሳይቱ ሳይቆይ ወደ verify-otp ገጽ እንዲቀየር ያደርገዋል
    res.status(200).json({
      success: true,
      message: "OTP ተፈጥሯል",
      debugOtp: otp,
    });

    // ሐ. ኢሜይሉን ከምላሹ በኋላ 'በጀርባ' እንዲሞክር አዘዝነው
    // 'await' ስለሌለው ሰርቨሩ አይቆምም
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `የእርስዎ ማረጋገጫ ኮድ፡ ${otp}`,
      })
      .catch((err) =>
        console.log("📧 Background Email Error (Timeout):", err.message)
      );
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
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
