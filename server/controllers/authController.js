import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const registerSendOtpController = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone)
      return res
        .status(400)
        .json({ success: false, message: "Email/Phone ይሙሉ" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await User.findOneAndUpdate(
      { email },
      { email, phone, otp, isVerified: false },
      { upsert: true }
    );

    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Code",
      text: `Your OTP is: ${otp}`,
    });

    return res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (err) {
    console.log("CRITICAL EMAIL ERROR:", err); // Render Logs ላይ ይሄን ፈልግ
    return res
      .status(500)
      .json({ success: false, message: "የኢሜይል ችግር: " + err.message });
  }
};

export const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp });
  if (user) {
    user.isVerified = true;
    user.otp = null;
    await user.save();
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ success: false, message: "ኮዱ ስህተት ነው" });
};
