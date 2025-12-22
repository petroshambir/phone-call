import express from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";

const router = express.Router();

// 1. Nodemailer Configuration (ኢሜይል መላኪያ ቅንብር)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password መሆኑን ያረጋግጡ
  },
  tls: {
    rejectUnauthorized: false, // በ Render ላይ ግንኙነቱ እንዳይዘጋ ይረዳል
  },
});

// --- 🟢 1. OTP መላኪያ (Register & Send OTP) ---
router.post("/register-send-otp", async (req, res) => {
  try {
    const { email, phone } = req.body;

    // መረጃ መሟላቱን ማረጋገጥ
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "እባክዎ ኢሜይል እና ስልክ ያስገቡ" });
    }

    // ባለ 6 አሃዝ የዘፈቀደ ቁጥር (OTP) መፍጠር
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // ተጠቃሚውን ዳታቤዝ ውስጥ መፈለግ ወይም መፍጠር (Upsert)
      await User.findOneAndUpdate(
        { email },
        { email, phone, otp, isVerified: false },
        { upsert: true, new: true }
      );

      // ኢሜይሉን መላክ
      await transporter.sendMail({
        from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "የማረጋገጫ ኮድ - Habesha Tel",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Habesha Tel</h2>
            <p>እንኳን ደህና መጡ! የእርስዎ መለያ ማረጋገጫ ኮድ ከዚህ በታች ያለው ነው፦</p>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px;">
              <span style="font-size: 28px; font-weight: bold; color: #1e40af; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">ይህ ኮድ ለ 10 ደቂቃ ብቻ ያገለግላል።</p>
          </div>
        `,
      });

      console.log(`✅ OTP (${otp}) sent to: ${email}`);
      res.status(200).json({ success: true, message: "OTP ተልኳል" });
    } catch (dbOrEmailError) {
      console.error("❌ Email or DB Error:", dbOrEmailError.message);
      res
        .status(500)
        .json({
          success: false,
          message:
            "ኮዱን መላክ አልተቻለም፤ እባክዎ የ Gmail App Password በትክክል መሙላትዎን ያረጋግጡ።",
        });
    }
  } catch (criticalError) {
    console.error("❌ Server Error:", criticalError.message);
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት ተፈጥሯል" });
  }
});

// --- 🔵 2. OTP ማረጋገጫ (Verify OTP) ---
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ኮድ ያስፈልጋል" });
    }

    // ተጠቃሚውን መፈለግ
    const user = await User.findOne({ email });

    // ኮዱ ትክክል መሆኑን ማረጋገጥ
    if (user && user.otp === otp) {
      user.isVerified = true;
      user.otp = null; // ኮዱን አንዴ ከተጠቀመበት በኋላ ማጥፋት
      await user.save();

      console.log(`✅ User verified: ${email}`);
      return res.status(200).json({ success: true, message: "ማረጋገጫ ተሳክቷል" });
    }

    res.status(400).json({ success: false, message: "ያስገቡት ኮድ የተሳሳተ ነው" });
  } catch (err) {
    console.error("❌ Verification Error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "በማረጋገጥ ሂደት ላይ ስህተት ተፈጥሯል" });
  }
});

export default router;
