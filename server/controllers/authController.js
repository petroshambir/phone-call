import User from "../models/userModel.js";
import nodemailer from "nodemailer";

export const registerSendOtpController = async (req, res) => {
  try {
    // 1. መረጃው መምጣቱን ቼክ እናድርግ
    console.log("ከFrontend የመጣ ዳታ:", req.body);
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "ኢሜይል ወይም ስልክ ጎድሏል" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await User.findOneAndUpdate(
      { email },
      { email, phone, otp },
      { upsert: true }
    );

    // 2. ኢሜይል መላኪያ (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // <--- 16 ፊደል App Password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Code",
      text: `የእርስዎ ኮድ: ${otp}`,
    });

    res.status(200).json({ success: true, message: "ኮዱ ተልኳል" });
  } catch (error) {
    console.error("የሰርቨር ስህተት:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
