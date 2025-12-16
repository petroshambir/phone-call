
// import express from "express";
// import User from "../models/userModel.js";
// import nodemailer from "nodemailer";

// const router = express.Router();

// // Nodemailer setup
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ------------------------------------
// // 1. REGISTER & SEND OTP
// // ------------------------------------
// router.post("/register-send-otp", async (req, res) => {
//   try {
//     const { email, phone } = req.body;
//     if (!email || !phone) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email and phone required" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     let user = await User.findOne({ email });

//     if (!user) {
//       // አዲስ ተጠቃሚ
//       user = await User.create({ email, phone, otp, isVerified: false });
//     } else {
//       // ያለውን ተጠቃሚ አድስ
//       user.otp = otp;
//       user.isVerified = false;
//       await user.save();
//     } // ኢሜይል ላክ

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP code is: ${otp}`,
//     });

//     res.json({ success: true, message: "OTP sent successfully!", otp });
//   } catch (err) {
//     console.error("register-send-otp error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ------------------------------------
// // 2. GET user by phone (ደቂቃውን ለማምጣት ለ Home.jsx)
// // ------------------------------------
// // ... (imports and Nodemailer setup) ...

// // ------------------------------------
// // 2. GET user by phone (ደቂቃውን ለማምጣት ለ Home.jsx)
// // ------------------------------------
// router.get("/user", async (req, res) => {
//   try {
//     const { phone } = req.query;

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number is required",
//       });
//     }

//     const user = await User.findOne({ phone });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.json({
//       success: true,
//       user: {
//         phone: user.phone,
//         email: user.email, 
//         minutes: user.minutes !== undefined ? user.minutes : 0, // ትክክል ነው
//         name: user.name || "",
//         isVerified: user.isVerified || false,
//       },
//     });
//   } catch (err) {
//     // ... error handling ...
//   }
// });

// // ... (ቀሪዎቹ routes)
// // ------------------------------------
// // 3. VERIFY OTP
// // ------------------------------------
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email and OTP required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) return res.json({ success: false, message: "User not found!" });

//     if (user.otp !== otp)
//       return res.json({ success: false, message: "Incorrect OTP!" }); // ማረጋገጫ ከተሳካ በኋላ

//     user.isVerified = true;
//     user.otp = null;
//     await user.save();

//     res.json({ success: true, message: "Verification successful!" });
//   } catch (err) {
//     console.error("verify-otp error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;

import express from "express";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Nodemailer setup
// 🔑 ማስተካከያ: Gmail Host, Port, እና Timeoutን ጨምረናል (ለ ETIMEDOUT ስህተት)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail SMTP Host
  port: 587, // Standard TLS port
  secure: false, // For port 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }, // ለ Render ረጅም ጊዜ ለመስጠት Timeout ጨምረናል
  connectionTimeout: 15000, // 15 ሰከንድ
  greetingTimeout: 8000, // 8 ሰከንድ
});

// ------------------------------------
// 1. REGISTER & SEND OTP
// ------------------------------------
router.post("/register-send-otp", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Email and phone required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let user = await User.findOne({ email });

    if (!user) {
      // አዲስ ተጠቃሚ
      user = await User.create({ email, phone, otp, isVerified: false });
    } else {
      // ያለውን ተጠቃሚ አድስ
      user.otp = otp;
      user.isVerified = false;
      await user.save();
    } // ኢሜይል ላክ

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent successfully!", otp });
  } catch (err) {
    console.error("register-send-otp error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------------------
// 2. GET user by phone (ደቂቃውን ለማምጣት ለ Home.jsx)
// ------------------------------------
router.get("/user", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        phone: user.phone,
        email: user.email,
        minutes: user.minutes !== undefined ? user.minutes : 0, // ትክክል ነው
        name: user.name || "",
        isVerified: user.isVerified || false,
      },
    });
  } catch (err) {
    console.error("get-user-by-phone error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------------------------
// 3. VERIFY OTP
// ------------------------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found!" });

    if (user.otp !== otp)
      return res.json({ success: false, message: "Incorrect OTP!" }); // ማረጋገጫ ከተሳካ በኋላ

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ success: true, message: "Verification successful!" });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;