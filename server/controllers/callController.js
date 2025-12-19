const Zadarma = require("zadarma");
const User = require("../models/userModel.js");

// Zadarma Setup (ቁልፎቹ ከ .env ይነበባሉ)
const api = new Zadarma({
  key: process.env.ZADARMA_KEY,
  secret: process.env.ZADARMA_SECRET,
});

const REQUIRED_MINUTES_PER_CALL = 1;

// ************************************************************
// የጥሪ ሎጂክን የሚያስተናግድ ተግባር (Zadarma Controller)
// ************************************************************
exports.startCall = async (req, res) => {
  // 1. ከ Frontend የተላከውን መረጃ መቀበል
  // userPhone: ተደዋይ (ኤርትራ)
  // clientPhoneNumber: ደዋይ (ያንተ ስልክ)
  const { userPhone, clientPhoneNumber } = req.body;

  if (!userPhone || !clientPhoneNumber) {
    return res.status(400).json({
      success: false,
      message: "የተደዋይ እና የደዋይ ስልክ ቁጥር ያስፈልጋል",
    });
  }

  try {
    // 2. በዳታቤዝ ውስጥ ተጠቃሚውን እና ደቂቃውን ማረጋገጥ
    const user = await User.findOne({ phone: clientPhoneNumber });

    if (!user || user.minutes < REQUIRED_MINUTES_PER_CALL) {
      return res.status(403).json({
        success: false,
        message: "በቂ ደቂቃ የለዎትም! እባክዎ ቀሪ ሂሳብዎን ይሙሉ።",
      });
    }

    // 3. Zadarma Callback ጥሪ ማዘዝ
    // 'from' መጀመሪያ ለደዋዩ ይደውላል፣ 'to' ደዋዩ ሲያነሳ ለኤርትራው ቁጥር ይደውላል
    api.request(
      "/v1/request/callback/",
      {
        from: clientPhoneNumber,
        to: userPhone,
      },
      async (err, data) => {
        if (err) {
          console.error("❌ Zadarma API Error:", err);
          return res.status(500).json({
            success: false,
            message: "ከጥሪ ሰርቨሩ ጋር መገናኘት አልተቻለም",
          });
        }

        const response = typeof data === "string" ? JSON.parse(data) : data;

        if (response.status === "success") {
          // 4. ጥሪው ከተሳካ ደቂቃ መቀነስ
          user.minutes -= REQUIRED_MINUTES_PER_CALL;
          await user.save();

          console.log(
            `✅ Zadarma Call Started: From ${clientPhoneNumber} to ${userPhone}`
          );

          res.status(200).json({
            success: true,
            message: "ጥሪው እየተሞከረ ነው! መጀመሪያ ለርስዎ ይደወልልዎታል፣ ያንሱት።",
            minutesRemaining: user.minutes,
          });
        } else {
          console.error("❌ Zadarma Response Error:", response.message);
          res.status(400).json({
            success: false,
            message: response.message || "ጥሪውን መጀመር አልተቻለም",
          });
        }
      }
    );
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({
      success: false,
      message: "የሰርቨር ስህተት አጋጥሟል።",
      error: error.message,
    });
  }
};
