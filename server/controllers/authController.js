import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password
  },
});

export const registerSendOtpController = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone)
      return res
        .status(400)
        .json({ success: false, message: "Email and phone required!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate(
      { email },
      { email, phone, otp, isVerified: false },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "የምዝገባ ኮድ",
      html: `<h3>ኮድዎ: <b style="color:blue;">${otp}</b></h3>`,
    });

    res.json({ success: true, message: "OTP ተልኳል!" });
  } catch (err) {
    console.error("Auth Error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "የሰርቨር ስህተት: " + err.message });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (user && user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: "የተሳሳተ ኮድ" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
