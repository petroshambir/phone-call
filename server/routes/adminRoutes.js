import express from "express";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import twilio from "twilio";

dotenv.config();
const router = express.Router();

// 1. Twilio Client አዋቅር
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// ለቅጽበታዊ ማዘመን (SSE)
const activeConnections = new Map();

// --- SSE Endpoint ---
router.get("/updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const phone = req.query.phone;
  if (phone) {
    activeConnections.set(phone, res);
  }

  req.on("close", () => {
    if (phone) activeConnections.delete(phone);
  });
});

// --- Admin Login ---
router.post("/admin-login", (req, res) => {
  const { email, password } = req.body;
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      success: true,
      message: "Admin login successful",
      token: "example-admin-token",
    });
  }
  return res.status(401).json({ success: false, message: "የተሳሳተ የይለፍ ቃል!" });
});

// --- ደቂቃ ለመጨመር እና ጥሪ ለመጀመር (Add Minutes & Trigger Call) ---
router.post("/add-minutes", async (req, res) => {
  console.log("🚀 /add-minutes ተጠራ");
  try {
    const { phone, minutes } = req.body;

    if (!phone || !minutes) {
      return res
        .status(400)
        .json({ success: false, message: "ስልክ እና ደቂቃ ያስፈልጋል" });
    }

    // 1. Database ማዘመን
    const user = await User.findOneAndUpdate(
      { phone: phone },
      { $inc: { minutes: Number(minutes) } },
      { new: true, upsert: true }
    );

    console.log(`✅ ደቂቃ ተጨምሯል:: አሁን ያለው ጠቅላላ ደቂቃ: ${user.minutes}`);

    // 2. Twilio Voice Call (ጥሪ ማስጀመር)
    try {
      await client.studio.v2
        .flows(process.env.TWILIO_FLOW_SID)
        .executions.create({
          to: phone,
          from: process.env.TWILIO_PHONE_NUMBER,
        });
      console.log(`📞 ጥሪ ወደ ${phone} ተልኳል!`);
    } catch (twilioErr) {
      console.error("❌ Twilio Call Error:", twilioErr.message);
    }

    // 3. SSE Update (ለተጠቃሚው ስክሪን እንዲታይ)
    const userConnection = activeConnections.get(user.phone);
    if (userConnection) {
      userConnection.write(
        `data: ${JSON.stringify({
          type: "minutes_updated",
          totalMinutes: user.minutes,
          phone: user.phone,
        })}\n\n`
      );
    }

    res.json({
      success: true,
      message: `ደቂቃ ተጨምሯል ጥሪም ተጀምሯል!`,
      user: user,
    });
  } catch (err) {
    console.error("❌ Add minutes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
