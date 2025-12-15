// authController.js
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

// -----------------
// Nodemailer setup
// -----------------
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail እንደ ሳስታት
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password ካለ
  },
});

// -----------------
// Register & Send OTP
// -----------------
export const registerSendOtpController = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone)
      return res
        .status(400)
        .json({ success: false, message: "Email and phone required!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, phone, otp, isVerified: false });
    } else {
      user.otp = otp;
      user.isVerified = false;
      await user.save();
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent successfully!", otp });
  } catch (err) {
    console.error("registerSendOtp error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------
// Verify OTP
// -----------------
export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required!" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found!" });

    if (user.otp !== otp)
      return res.json({ success: false, message: "Incorrect OTP!" });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ success: true, message: "Verification successful!" });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
