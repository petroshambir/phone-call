
const twilio = require("twilio");
// የ User ሞዴልህን እዚህ መጫን ትችላለህ (የ Database Logic ለመጨመር)
// const User = require("../models/userModel.js"); 

// 🚨 እነዚህን እሴቶች በ .env ፋይልህ ውስጥ ካሉ ትክክለኛ እሴቶች ጋር ተካ!
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; 

// የ Twilio Client ን መጀመር
const client = twilio(accountSid, authToken);

// ************************************************************
// የጥሪ ሎጂክን የሚያስተናግድ ተግባር (Controller)
// ************************************************************
exports.startCall = async (req, res) => {
    // 1. ከ Frontend የተላከውን መረጃ መቀበል
    // ⚠️ callDuration የ Database Logic ሲጨመር ይበልጥ ጠቃሚ ይሆናል
    const { userPhone, callDuration } = req.body; 

    if (!userPhone || !callDuration) {
        return res
            .status(400)
            .json({ success: false, message: "የስልክ ቁጥርና የደቂቃ መጠን ያስፈልጋል" });
    }

    // ⚠️ Database Logic እዚህ ውስጥ መግባት አለበት (የደቂቃ ቅነሳ ወዘተ)

    try {
        // ✅ 2. BASE_URLን ከ .env አምጣና Webhook URL ፍጠር (Runtime)
        const BASE_URL = process.env.BASE_URL;
        
        // 🔑 ይህ URL Twilio ለድምጽ የሚደውልበት መንገድ ነው!
        const TWIML_WEBHOOK_URL_RUNTIME = `${BASE_URL}/api/call/twiml-control`;

        // የሚደወለውን ቁጥር በ Query Parameter ውስጥ አስገባ (ለ twiml-control እንዲደርስ)
        const callUrlWithTarget = `${TWIML_WEBHOOK_URL_RUNTIME}?targetNumber=${userPhone}`;

        // 3. Twilio ጥሪውን ይጀምራል
        const call = await client.calls.create({
            // 🔑 ትክክለኛው Webhook URL እዚህ ገብቷል!
            url: callUrlWithTarget, 
            to: userPhone, // ለመደወል የፈለግነው ቁጥር
            from: twilioPhoneNumber, // የእርስዎ Twilio ቁጥር
        });

        console.log(`✅ Twilio Call Initiated: SID ${call.sid} to ${userPhone}`);

        // 4. ለ Frontend ምላሽ መስጠት
        res.status(200).json({
            success: true,
            message: "ጥሪው በተሳካ ሁኔታ ተጀምሯል!",
        });

    } catch (error) {
        console.error("❌ Error initiating Twilio call:", error.message);
        res.status(500).json({
            success: false,
            message: "ጥሪውን ለመጀመር አልተቻለም። ሰርቨርህን አረጋግጥ።",
        });
    }
};

// ************************************************************
// ⚠️ አስታውስ: TwiML ራውት በሌላ ቦታ (callRoutes.js) ተቀምጧል!
// ⚠️ ያንን ራውት በትክክል መሙላትህን አረጋግጥ!
// ************************************************************