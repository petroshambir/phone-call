import express from "express";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Zadarma = require("zadarma"); // ድሮው ግን አስተማማኝ አጠራር

const router = express.Router();
const REQUIRED_MINUTES_PER_CALL = 1;

// 1. Zadarma Configuration
let api;
try {
  // አሁን Zadarma በትክክል Constructor ሆኖ ይገኛል
  api = new Zadarma({
    key: process.env.ZADARMA_KEY,
    secret: process.env.ZADARMA_SECRET,
  });
  console.log("✅ Zadarma API Initialized Successfully");
} catch (error) {
  console.error("❌ Zadarma Initialization Error:", error.message);
}

// 2. Nodemailer Configuration

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // እዚህ ጋር ባለ 16 አሃዝ App Password መሆኑን በድጋሚ አረጋግጥ
  },
});

// --- OTP ROUTES ---
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );
    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `<h3>Habesha Tel</h3><p>የማረጋገጫ ኮድዎ፡ <b>${otp}</b></p>`,
    });
    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (user && user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: "የተሳሳተ ኮድ!" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// --- ZADARMA CALL ROUTE ---
router.post("/call-user", async (req, res) => {
  const { userPhone, clientPhoneNumber } = req.body;
  console.log(
    `📞 Zadarma Call Request: To ${userPhone} From ${clientPhoneNumber}`
  );

  if (!api) {
    return res
      .status(500)
      .json({ success: false, message: "Zadarma API አልተዘጋጀም" });
  }

  try {
    const user = await User.findOne({ phone: clientPhoneNumber });
    if (!user || user.minutes < REQUIRED_MINUTES_PER_CALL) {
      return res.status(403).json({ success: false, message: "በቂ ደቂቃ የለዎትም!" });
    }

    api.request(
      "/v1/request/callback/",
      {
        from: clientPhoneNumber,
        to: userPhone,
      },
      async (err, data) => {
        if (err) {
          console.error("❌ Zadarma Error:", err);
          return res
            .status(500)
            .json({ success: false, message: "ከጥሪ ሰርቨሩ ጋር መገናኘት አልተቻለም" });
        }
        const response = typeof data === "string" ? JSON.parse(data) : data;
        if (response.status === "success") {
          user.minutes -= REQUIRED_MINUTES_PER_CALL;
          await user.save();
          res.json({
            success: true,
            message: "ጥሪው እየተደረገ ነው...",
            minutesRemaining: user.minutes,
          });
        } else {
          res
            .status(400)
            .json({
              success: false,
              message: response.message || "ጥሪውን መጀመር አልተቻለም",
            });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
