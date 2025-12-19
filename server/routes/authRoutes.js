import express from "express";
import twilio from "twilio";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";

const router = express.Router();

// --- 1. CONFIGURATIONS ---
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const REQUIRED_MINUTES_PER_CALL = 1;

// Nodemailer Transporter (ለGmail አስተማማኝ የሆነው አቀማመጥ)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // ለ Port 587 false መሆን አለበት
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// --- 2. EMAIL OTP ROUTES ---

// ሀ. OTP መፍጠር እና መላክ
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // 1. መረጃውን ዳታቤዝ ላይ ማስቀመጥ
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );

    // 2. ኢሜይሉን መላክ (ይህ 'await' መሆን አለበት)
    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `የእርስዎ ማረጋገጫ ኮድ፡ ${otp}`,
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
              <h2>Habesha Tel</h2>
              <p>ሰላም፣ የሪል ማረጋገጫ ኮድዎ ከታች ያለው ነው፡</p>
              <h1 style="color: #4CAF50;">${otp}</h1>
             </div>`,
    });

    console.log(`✅ OTP ተልኳል ወደ: ${email}`);
    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("📧 Email Error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "ኢሜይል መላክ አልተቻለም",
        error: error.message,
      });
  }
});

// ለ. OTP ማረጋገጥ
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "ተጠቃሚው አልተገኘም" });

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null; // ኮዱ አንዴ ከሰራ በኋላ ይጠፋል
      await user.save();
      return res.json({ success: true, message: "ማረጋገጫው ተሳክቷል!" });
    } else {
      return res.status(400).json({ success: false, message: "የተሳሳተ ኮድ ነው!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

// --- 3. CALL ROUTES (TWILIO) ---

// ሀ. Twilio Webhook
router.post("/twiml-control", (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  let targetNumber = req.query.targetNumber || req.body.To;

  if (targetNumber) {
    if (!targetNumber.startsWith("+")) targetNumber = "+" + targetNumber;
    twiml.say(
      { voice: "alice", language: "en-US" },
      "Connecting your call. Please wait."
    );
    twiml.dial(targetNumber);
  } else {
    twiml.say("Sorry, the number is missing.");
  }

  res.type("text/xml").send(twiml.toString());
});

// ለ. ጥሪ መጀመር
router.post("/call-user", async (req, res) => {
  const { userPhone, clientPhoneNumber } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        phone: clientPhoneNumber,
        minutes: { $gte: REQUIRED_MINUTES_PER_CALL },
      },
      { $inc: { minutes: -REQUIRED_MINUTES_PER_CALL } },
      { new: true }
    );

    if (!updatedUser)
      return res.status(403).json({ success: false, message: "በቂ ደቂቃ የለዎትም!" });

    const callUrl = `https://phone-call-backend.onrender.com/api/twiml-control?targetNumber=${encodeURIComponent(
      userPhone
    )}`;

    await client.calls.create({
      url: callUrl,
      to: clientPhoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    res.json({
      success: true,
      message: "ጥሪ ተጀምሯል!",
      minutesRemaining: updatedUser.minutes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
