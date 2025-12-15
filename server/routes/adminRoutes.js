
import express from "express";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import twilio from "twilio";

dotenv.config();
const router = express.Router();

// 2. Twilio Client አዋቅር
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// (የ TEST_PHONE_NUMBER መስመርን በትክክል አጥፍተዋል - በጣም ጥሩ!)

// ✅ ለቅጽበታዊ ማዘመን (Server-Sent Events - SSE)
const activeConnections = new Map();

// 1. SSE updates endpoint
router.get("/updates", (req, res) => {
// ... (SSE updates ኮድህ አልተለወጠም) ...
});

// ************************************************************
// 🔑 Admin Login Route
// // ************************************************************
// router.post("/admin-login", (req, res) => {
// // ... (admin-login ኮድህ አልተለወጠም) ...
// });
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

  return res.status(401).json({ success: false, message: "Invalid password" });
});
// *************************************************************


// 4. Add minutes to a user (የተስተካከለው ሙሉ Route)
router.post("/add-minutes", async (req, res) => {
    console.log("1. /add-minutes Route ተጠራ");

    try {
        // ✅ ትክክለኛውን phone እና minutes ከ request body ያዝ
        const { phone, minutes } = req.body;

        if (!phone || !minutes) {
            console.log("❌ ስልክ ወይም ደቂቃ ጠፍቷል");
            return res.status(400).json({
                success: false,
                message: "Phone and minutes are required",
            });
        }
        
        console.log("2. ከ Frontend የመጣው phone:", phone, "Minutes:", minutes);

        // 3. የDatabase ስራ: ደቂቃውን ወደ Database ይጨምር
        const user = await User.findOneAndUpdate(
            { phone: phone }, // <= ትክክለኛውን ስልክ ቁጥር ይጠቀማል
            { $inc: { minutes: Number(minutes) } },
            { new: true, upsert: true } // upsert:true ተጠቃሚው ከሌለ እንዲፈጥር ያደርጋል
        );

        if (!user) {
            console.log("❌ ተጠቃሚው አልተገኘም (እና upsert አልሰራም)");
            return res.status(404).json({
                success: false,
                message: "User not found (and upsert failed)",
            });
        }
        
        console.log("4. የDatabase ኦፕሬሽን ያለ ችግር አልፏል. አዲስ ደቂቃ:", user.minutes);

        // 5. 📞 Twilio Voice Call (ጥሪው የሚሄደው ለተጠቃሚው ነው)
        try {
            await client.studio.v2
                .flows(process.env.TWILIO_FLOW_SID)
                .executions.create({
                    to: phone, // ✅ አሁን ትክክለኛውን የተጠቃሚ ስልክ ቁጥር ይጠቀማል!
                    from: process.env.TWILIO_PHONE_NUMBER,
                });
            console.log(`✅ 6. ጥሪ ወደ ${phone} ተልኳል!`);
        } catch (twilioErr) {
            console.error("❌ 6. የTwilio ጥሪ ስህተት:", twilioErr.message);
        }

        // 7. SSE Update (ቅጽበታዊ ማዘመን)
        const userConnection = activeConnections.get(user.phone);
        if (userConnection) {
            // ... (SSE ኮድህ) ...
            userConnection.write(`data: ${JSON.stringify({
                type: "minutes_updated",
                minutesAdded: minutes,
                totalMinutes: user.minutes,
                phone: user.phone,
                timestamp: new Date().toISOString(),
            })}\n\n`);
        }

        res.json({
            success: true,
            message: `${minutes} minutes added to ${user.phone}. Voice call triggered!`,
            user: {
                phone: user.phone,
                minutes: user.minutes,
                updatedAt: new Date(),
            },
        });
    } catch (err) {
        console.error("❌ 8. Add minutes error:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// 7. Update minutes directly (ለጥሪ ቅነሳ)
router.post("/update-minutes", async (req, res) => {
  // ... (code for update-minutes) ...
});

export default router;