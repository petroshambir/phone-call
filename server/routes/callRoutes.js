
// import twilio from "twilio";
// import User from "../models/userModel.js";
// import express from "express";
// const router = express.Router();

// // ************************************************************
// // 1. Twilio Client Initialization & Configuration
// // ************************************************************
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

// // ደቂቃው ከ Database ላይ የሚቀነስበት መጠን
// const REQUIRED_MINUTES_PER_CALL = 1;

// // ************************************************************
// // 2. 🔑 TwiML Webhook Route (ድምፅን የሚቆጣጠር - የተስተካከለ)
// // ************************************************************
// // Twilio ጥሪው አንዴ ከተነሳ በኋላ Webhookን ይጠራዋል
// router.post("/twiml-control", (req, res) => {
//   console.log("Twilio Webhook: TwiML ጥያቄ ደርሷል");
//   const VoiceResponse = twilio.twiml.VoiceResponse;
//   const twiml = new VoiceResponse(); // targetNumber የሚመጣው ከ call-user ራውት በ Query Parameter ነው
//   const targetNumber = req.query.targetNumber;

//   if (targetNumber) {
//     // 📞 ትክክለኛው ማገናኘት (Bridging):
//     // Twilioን መጀመሪያ የደወለውን ሰው (The Caller) ከ targetNumber ጋር እንዲያገናኘው ያዛል።
//     twiml.say("ጥሪዎ አሁን እየተገናኘ ነው። እባክዎ ይጠብቁ።");
//     twiml.dial(targetNumber); // 👈 ትክክለኛው ቁጥር ተደውሎ ከመጀመሪያው ደዋይ ጋር ይገናኛል
//     console.log(`TwiML: ወደ ተደዋይ ቁጥር ${targetNumber} ለመደወል <Dial> ተልኳል።`);
//   } else {
//     twiml.say("Sorry, the target number was not found in the URL. Goodbye!");
//     console.log("TwiML: ተደዋይ ቁጥር አልተገኘም፣ ጥሪው ይቋረጣል።");
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// });

// // ************************************************************
// // 3. 🔑 ጥሪውን የሚጀምረው API (/call-user - የተስተካከለ)
// // ************************************************************
// router.post("/call-user", async (req, res) => {
//   // userPhone = የመጨረሻው ተደዋይ ቁጥር (ለምሳሌ የደንበኛ ቁጥር)
//   // clientPhoneNumber = Twilio መጀመሪያ የሚደውልለት ቁጥር (ለምሳሌ የእርስዎ ኦፕሬተር/ስልክ)
//   const { userPhone, clientPhoneNumber } = req.body;

//   console.log(`1. የጥሪ ጥያቄ ደርሷል: ተደዋይ: ${userPhone}, ደዋይ: ${clientPhoneNumber}`);

//   if (
//     !userPhone ||
//     !userPhone.startsWith("+") ||
//     !clientPhoneNumber ||
//     !clientPhoneNumber.startsWith("+")
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "ትክክለኛ የስልክ ቁጥር ፎርማት ያስፈልጋል (+ ሀገር ኮድ)",
//     });
//   }

//   try {
//     // 2. ደቂቃውን ከ Database ላይ መቀነስ
//     const updatedUser = await User.findOneAndUpdate(
//       {
//         phone: clientPhoneNumber,
//         minutes: { $gte: REQUIRED_MINUTES_PER_CALL },
//       }, // 🔑 ማስተካከያ: ደቂቃውን ከደንበኛው ቁጥር ቀንስ
//       { $inc: { minutes: -REQUIRED_MINUTES_PER_CALL } },
//       { new: true }
//     );

//     if (!updatedUser) {
//       console.log("❌ በቂ ደቂቃ የለም ወይም ተጠቃሚው የለም።");
//       return res.status(403).json({
//         success: false,
//         message: "ለዚህ ጥሪ በቂ ደቂቃ የለዎትም!",
//         minutesRemaining: 0,
//       });
//     }

//     console.log(`✅ 3. ደቂቃ ተቀንሷል: ቀሪው ደቂቃ ${updatedUser.minutes}`); // ✅ Twilio ጥሪ ይጀምር

//     const BASE_URL_RUNTIME = process.env.BASE_URL;
//     const TWIML_WEBHOOK_URL_RUNTIME = `${BASE_URL_RUNTIME}/api/call/twiml-control`; // የሚደወለውን የመጨረሻ ቁጥር (userPhone) በ Query Parameter ውስጥ አስገባ
//     const callUrlWithTarget = `${TWIML_WEBHOOK_URL_RUNTIME}?targetNumber=${userPhone}`; // 4. Twilio መጀመሪያ ወደ clientPhoneNumber ይደውላል።

//     await client.calls.create({
//       url: callUrlWithTarget, // Twilio TwiML ለማግኘት ወደዚህ ይሄዳል
//       to: clientPhoneNumber, // 👈 Twilio መጀመሪያ ወደዚህ ይደውላል
//       from: process.env.TWILIO_PHONE_NUMBER,
//     });

//     console.log("✅ 5. Twilio ጥሪ ተልኳል (Twilio -> clientPhoneNumber)።");

//     return res.json({
//       success: true,
//       message: "ጥሪ ተጀምሯል!",
//       minutesRemaining: updatedUser.minutes,
//     });
//   } catch (error) {
//     console.error("❌ 6. የሰርቨር ስህተት:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "የሰርቨር ስህተት", error: error.message });
//   }
// });

// export default router;



import twilio from "twilio";
import User from "../models/userModel.js";
import express from "express";
const router = express.Router();

// ************************************************************
// 1. Twilio Client Initialization & Configuration
// ************************************************************
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// ደቂቃው ከ Database ላይ የሚቀነስበት መጠን
const REQUIRED_MINUTES_PER_CALL = 1;

// ************************************************************
// 2. 🔑 TwiML Webhook Route (ድምፅን የሚቆጣጠር - የተስተካከለ)
// ************************************************************
// Twilio ጥሪው አንዴ ከተነሳ በኋላ Webhookን ይጠራዋል
router.post("/twiml-control", (req, res) => {
  console.log("Twilio Webhook: TwiML ጥያቄ ደርሷል");
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  const targetNumber = req.query.targetNumber; // userPhone ይዟል

  if (targetNumber) {
    // 📞 ትክክለኛው ማገናኘት (Bridging):
    // Twilioን መጀመሪያ የደወለውን ሰው (The Caller) ከ targetNumber ጋር እንዲያገናኘው ያዛል።
    twiml.say("ጥሪዎ አሁን እየተገናኘ ነው። እባክዎ ይጠብቁ።");
    twiml.dial(targetNumber); // 👈 ትክክለኛው ቁጥር ተደውሎ ከመጀመሪያው ደዋይ ጋር ይገናኛል
    console.log(`TwiML: ወደ ተደዋይ ቁጥር ${targetNumber} ለመደወል <Dial> ተልኳል።`);
  } else {
    // ይህ የሚሆነው Twilio Webhook URL ላይ targetNumber ካልተላከ ብቻ ነው።
    twiml.say("Sorry, the target number was not found in the URL. Goodbye!");
    console.log("TwiML: ተደዋይ ቁጥር አልተገኘም፣ ጥሪው ይቋረጣል።");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// ************************************************************
// 3. 🔑 ጥሪውን የሚጀምረው API (/call-user - የተስተካከለ)
// ************************************************************
router.post("/call-user", async (req, res) => {
  // userPhone = የመጨረሻው ተደዋይ ቁጥር (ለምሳሌ የደንበኛ ቁጥር)
  // clientPhoneNumber = Twilio መጀመሪያ የሚደውልለት ቁጥር (ለምሳሌ የእርስዎ ኦፕሬተር/ስልክ)
  const { userPhone, clientPhoneNumber } = req.body;

  console.log(`1. የጥሪ ጥያቄ ደርሷል: ተደዋይ: ${userPhone}, ደዋይ: ${clientPhoneNumber}`);

  if (
    !userPhone ||
    !userPhone.startsWith("+") ||
    !clientPhoneNumber ||
    !clientPhoneNumber.startsWith("+")
  ) {
    return res.status(400).json({
      success: false,
      message: "ትክክለኛ የስልክ ቁጥር ፎርማት ያስፈልጋል (+ ሀገር ኮድ)",
    });
  }

  try {
    // 2. ደቂቃውን ከ Database ላይ መቀነስ
    const updatedUser = await User.findOneAndUpdate(
      {
        phone: clientPhoneNumber,
        minutes: { $gte: REQUIRED_MINUTES_PER_CALL },
      },
      { $inc: { minutes: -REQUIRED_MINUTES_PER_CALL } },
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ በቂ ደቂቃ የለም ወይም ተጠቃሚው የለም።");
      return res.status(403).json({
        success: false,
        message: "ለዚህ ጥሪ በቂ ደቂቃ የለዎትም!",
        minutesRemaining: 0,
      });
    }

    console.log(`✅ 3. ደቂቃ ተቀንሷል: ቀሪው ደቂቃ ${updatedUser.minutes}`);

    const BASE_URL_RUNTIME = process.env.BASE_URL; // ⚠️ ወሳኝ ማስተካከያ: /api/call የሚለውን አስወግደናል
    const TWIML_WEBHOOK_URL_RUNTIME = `${BASE_URL_RUNTIME}/api/twiml-control`; // የሚደወለውን የመጨረሻ ቁጥር (userPhone) በ Query Parameter ውስጥ አስገባ

    const callUrlWithTarget = `${TWIML_WEBHOOK_URL_RUNTIME}?targetNumber=${userPhone}`; // 4. Twilio መጀመሪያ ወደ clientPhoneNumber ይደውላል።

    await client.calls.create({
      url: callUrlWithTarget, // Twilio TwiML ለማግኘት ወደዚህ ይሄዳል
      to: clientPhoneNumber, // 👈 Twilio መጀመሪያ ወደዚህ ይደውላል
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log("✅ 5. Twilio ጥሪ ተልኳል (Twilio -> clientPhoneNumber)።");

    return res.json({
      success: true,
      message: "ጥሪ ተጀምሯል!",
      minutesRemaining: updatedUser.minutes,
    });
  } catch (error) {
    console.error("❌ 6. የሰርቨር ስህተት:", error);
    res
      .status(500)
      .json({ success: false, message: "የሰርቨር ስህተት", error: error.message });
  }
});

export default router;