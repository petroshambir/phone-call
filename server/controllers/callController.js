import User from "../models/userModel.js";
import twilio from "twilio";

// Twilio Setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const REQUIRED_MINUTES_PER_CALL = 1;

export const startCall = async (req, res) => {
  const { userPhone, clientPhoneNumber } = req.body;

  if (!userPhone || !clientPhoneNumber) {
    return res.status(400).json({
      success: false,
      message: "የተደዋይ እና የደዋይ ስልክ ቁጥር ያስፈልጋል",
    });
  }

  try {
    // 1. ተጠቃሚውን መፈለግ (በስልክ ቁጥሩ)
    const user = await User.findOne({ phone: clientPhoneNumber });

    if (!user || user.minutes < REQUIRED_MINUTES_PER_CALL) {
      return res.status(403).json({
        success: false,
        message: "በቂ ደቂቃ የለዎትም! እባክዎ ቀሪ ሂሳብዎን ይሙሉ።",
      });
    }

    // 2. Twilio Call ማስጀመር (በ Zadarma ፋንታ)
    try {
      await client.calls.create({
        from: process.env.TWILIO_PHONE_NUMBER, // የእርስዎ Twilio ቁጥር
        to: userPhone, // የሚደወልለት ሰው
        url: "http://demo.twilio.com/docs/voice.xml", // ወይም የእርስዎ Flow URL
      });

      // 3. ደቂቃ መቀነስ
      user.minutes -= REQUIRED_MINUTES_PER_CALL;
      await user.save();

      console.log(`✅ ጥሪ ተጀምሯል ለ: ${userPhone}`);
      res.status(200).json({
        success: true,
        message: "ጥሪው እየተሞከረ ነው!",
        minutesRemaining: user.minutes,
      });
    } catch (twilioErr) {
      console.error("❌ Twilio Error:", twilioErr.message);
      res.status(500).json({ success: false, message: "Twilio ጥሪ መጀመር አልቻለም" });
    }
  } catch (error) {
    console.error("❌ Database Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
