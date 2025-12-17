import express from "express";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const router = express.Router();

// 1. Nodemailer Transporter ቅንብር (Outlook ተጠቅመናል)
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false, // Port 587 TLS ስለሆነ false መሆን አለበት
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ክፍተት የሌለበት App Password መሆኑን Render ላይ ያረጋግጡ
  },
  connectionTimeout: 20000,
  greetingTimeout: 10000,
});

// ------------------------------------
// 2. REGISTER & SEND OTP (ተስተካክሏል)
// ------------------------------------
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // ኢሜይል እና ስልክ መኖራቸውን ማረጋገጥ
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል እና ስልክ ያስፈልጋል" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ሀ. ተጠቃሚውን ዳታቤዝ ውስጥ ማስቀመጥ ወይም ማደስ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );

    console.log(`✅ ተጠቃሚ በ MongoDB ተቀምጧል/ታድሷል። OTP: ${otp}`);

    // ለ. ኢሜይል መላክ (ለብቻው በ try-catch ውስጥ)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "የምዝገባ ኮድ (OTP)",
        text: `የእርስዎ የማረጋገጫ ኮድ፡ ${otp}`,
      });
      console.log("📧 ኢሜይል በትክክል ተልኳል");
      return res.status(200).json({ success: true, message: "OTP ተልኳል!" });
    } catch (mailError) {
      // 🔑 ወሳኝ ክፍል፡ ኢሜይል ባይላክ እንኳ ሰርቨሩን አታቁመው (500 Errorን ይከላከላል)
      console.error("❌ የኢሜይል መላክ ስህተት (Timeout ወይም Auth):", mailError.message);

      // ለሙከራ እንዲመች OTP ተፈጥሯል ብለን ምላሽ እንልካለን
      return res.status(200).json({
        success: true,
        message: "OTP ተፈጥሯል (ኢሜይል ግን አልተላከም)",
        debugOtp: otp, // ይህንን በ Network Tab ውስጥ ማየት ትችላለህ
      });
    }
  } catch (error) {
    console.error("❌ አጠቃላይ የሰርቨር ስህተት:", error);
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት አጋጥሟል" });
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
      user.otp = null; // አንዴ ጥቅም ላይ ከዋለ በኋላ ማጥፋት
      await user.save();
      return res.json({ success: true, message: "ማረጋገጫው ተሳክቷል!" });
    } else {
      return res.json({ success: false, message: "የተሳሳተ ኮድ!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

// ------------------------------------
// 4. GET USER (ደቂቃን ለማየት)
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
