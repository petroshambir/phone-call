import twilio from "twilio";
import User from "../models/userModel.js";
import express from "express";
const router = express.Router();

// 1. Twilio Config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const REQUIRED_MINUTES_PER_CALL = 1;

// ************************************************************
// 2. 🔑 TwiML Webhook (ጥሪው ሲነሳ ድምፅ የሚያመጣው)
// ************************************************************
router.post("/twiml-control", (req, res) => {
  console.log("🔔 Twilio Webhook: TwiML ጥያቄ ደርሷል");

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // ቁጥሩን ከ Query ወይም ከ Body እንፈልጋለን
  let targetNumber =
    req.query.targetNumber || req.body.targetNumber || req.body.To;

  if (targetNumber) {
    // 🔑 ቁጥሩ በ '+' መጀመሩን እናረጋግጣለን (ለ Busy መፍትሄው ይሄ ነው)
    if (!targetNumber.startsWith("+")) {
      targetNumber = "+" + targetNumber;
    }

    console.log(`📞 ጥሪው ወደ ${targetNumber} እየተገናኘ ነው...`);

    twiml.say(
      { voice: "alice", language: "en-US" },
      "Connecting your call. Please wait."
    );

    // ተደዋዩን ማገናኘት
    twiml.dial(targetNumber);
  } else {
    console.log("⚠️ ስህተት፦ ተደዋይ ቁጥር አልተገኘም!");
    twiml.say("Sorry, the number is missing.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});
// ************************************************************
// 3. 🔑 ጥሪውን የሚጀምረው API (ተስተካክሏል)
// ************************************************************
router.post("/call-user", async (req, res) => {
  const { userPhone, clientPhoneNumber } = req.body;

  console.log(`1. የጥሪ ጥያቄ፡ ተደዋይ: ${userPhone}, ደዋይ: ${clientPhoneNumber}`);

  if (!userPhone?.startsWith("+") || !clientPhoneNumber?.startsWith("+")) {
    return res
      .status(400)
      .json({ success: false, message: "ቁጥሮች በ '+' መጀመር አለባቸው" });
  }

  try {
    // 2. ደቂቃ መቀነስ
    const updatedUser = await User.findOneAndUpdate(
      {
        phone: clientPhoneNumber,
        minutes: { $gte: REQUIRED_MINUTES_PER_CALL },
      },
      { $inc: { minutes: -REQUIRED_MINUTES_PER_CALL } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(403).json({ success: false, message: "በቂ ደቂቃ የለዎትም!" });
    }

    console.log(`✅ 3. ደቂቃ ተቀንሷል። ቀሪ፡ ${updatedUser.minutes}`);

    // 🔑 4. ቀጥታ የ Render URL መጠቀም (BASE_URL ችግር እንዳይፈጥር)
    const callUrl = `https://phone-call-backend.onrender.com/api/twiml-control?targetNumber=${encodeURIComponent(
      userPhone
    )}`;

    console.log(`🔗 Twilio የሚጠራው URL: ${callUrl}`);

    // 5. ጥሪውን መፍጠር
    await client.calls.create({
      url: callUrl,
      to: clientPhoneNumber, // መጀመሪያ ለአንተ ይደውላል
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log("✅ 5. Twilio ጥሪ ተልኳል።");

    return res.json({
      success: true,
      message: "ጥሪ ተጀምሯል! ስልኩ ሲነሳ ማንኛውንም ቁጥር ይጫኑ።",
      minutesRemaining: updatedUser.minutes,
    });
  } catch (error) {
    console.error("❌ የሰርቨር ስህተት:", error.message);
    res
      .status(500)
      .json({ success: false, message: "የሰርቨር ስህተት", error: error.message });
  }
});

export default router;
