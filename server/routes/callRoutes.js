// import express from "express";
// import Zadarma from "zadarma";
// import User from "../models/userModel.js";

// const router = express.Router();

// // 1. Zadarma Config (ከአሁን በኋላ Twilio አያስፈልግም)
// const api = new Zadarma({
//   key: process.env.ZADARMA_KEY,
//   secret: process.env.ZADARMA_SECRET,
// });

// const REQUIRED_MINUTES_PER_CALL = 1;

// // ************************************************************
// // 2. 🔑 ጥሪውን የሚጀምረው API (Zadarma Callback)
// // ************************************************************
// router.post("/call-user", async (req, res) => {
//   const { userPhone, clientPhoneNumber } = req.body;

//   console.log(
//     `📞 የ Zadarma ጥሪ ጥያቄ፡ ተደዋይ: ${userPhone}, ደዋይ: ${clientPhoneNumber}`
//   );

//   // የቁጥሮች ትክክለኛነት ማረጋገጫ
//   if (!userPhone?.startsWith("+") || !clientPhoneNumber?.startsWith("+")) {
//     return res.status(400).json({
//       success: false,
//       message: "ቁጥሮች በ '+' መጀመር አለባቸው (ለምሳሌ፦ +251...)",
//     });
//   }

//   try {
//     // ደቂቃ መቀነስ
//     const updatedUser = await User.findOneAndUpdate(
//       {
//         phone: clientPhoneNumber,
//         minutes: { $gte: REQUIRED_MINUTES_PER_CALL },
//       },
//       { $inc: { minutes: -REQUIRED_MINUTES_PER_CALL } },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(403).json({ success: false, message: "በቂ ደቂቃ የለዎትም!" });
//     }

//     console.log(`✅ ደቂቃ ተቀንሷል። ቀሪ ሂሳብ፡ ${updatedUser.minutes}`);

//     // 3. Zadarma Callback ማዘዝ
//     // 'from' ለደዋዩ (ለአንተ)፣ 'to' ለተደዋዩ (ለኤርትራ)
//     api.request(
//       "/v1/request/callback/",
//       {
//         from: clientPhoneNumber,
//         to: userPhone,
//       },
//       async (err, data) => {
//         if (err) {
//           console.error("❌ Zadarma API Error:", err);
//           return res.status(500).json({
//             success: false,
//             message: "ጥሪውን መጀመር አልተቻለም።",
//           });
//         }

//         const response = typeof data === "string" ? JSON.parse(data) : data;

//         if (response.status === "success") {
//           console.log("🚀 Zadarma ጥሪውን በስኬት ጀምሯል");
//           return res.json({
//             success: true,
//             message: "ጥሪ ተጀምሯል! መጀመሪያ ለርስዎ ስልክ ይደወላል፣ ሲያነሱት ይገናኛል።",
//             minutesRemaining: updatedUser.minutes,
//           });
//         } else {
//           return res.status(400).json({
//             success: false,
//             message: response.message || "Zadarma Error",
//           });
//         }
//       }
//     );
//   } catch (error) {
//     console.error("❌ የሰርቨር ስህተት:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "የሰርቨር ስህተት አጋጥሟል።",
//       error: error.message,
//     });
//   }
// });

// export default router;
