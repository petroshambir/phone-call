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
  const { email, phone, password } = req.body;

  try {
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ስልክ ያስፈልጋል" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ሀ. ተጠቃሚውን ዳታቤዝ ውስጥ ማስቀመጥ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );
    console.log(`✅ ተጠቃሚ ተመዝግቧል። OTP: ${otp}`);

    // ለ. 🔑 ኢሜይሉን መላክ (await አናደርገውም - ከጀርባ ይሞክራል)
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "የምዝገባ ኮድ",
        text: `የእርስዎ የማረጋገጫ ኮድ፡ ${otp}`,
      })
      .then(() => console.log("📧 ኢሜይል በትክክል ተልኳል"))
      .catch((err) => {
        console.log("❌ ኢሜይል መላክ አልተቻለም (Timeout):", err.message);
        // እዚህ ምንም አንመልስም - ሰርቨሩ ስራውን ይቀጥላል
      });

    // ሐ. 🔑 በጣም ወሳኝ፡ ይህ መልስ ከ transporter ውጭ ነው (Timeout ስህተትን ይፈታል)
    return res.status(200).json({
      success: true,
      message: "OTP ተፈጥሯል",
      debugOtp: otp,
    });
  } catch (error) {
    console.error("❌ የዳታቤዝ ስህተት:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
    }
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
