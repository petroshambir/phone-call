import express from "express";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

const router = express.Router();

// 1. Nodemailer Transporter ቅንብር
// const transporter = nodemailer.createTransport({
//   // 'host' ላይ በቀጥታ የGmail IP እንጠቀማለን (ይህ DNS Errorን ያስቀራል)
//   host: "173.194.76.108",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // ባለ 16 አሃዝ App Password
//   },
//   tls: {
//     rejectUnauthorized: false,
//     servername: "smtp.gmail.com", // ይህ ለደህንነት ማረጋገጫ አስፈላጊ ነው
//   },
//   connectionTimeout: 40000, // ጊዜውን ወደ 40 ሰከንድ አሳድገነዋል
//   greetingTimeout: 20000,
//   socketTimeout: 20000,
// });
// ------------------------------------
// 2. REGISTER & SEND OTP
// ------------------------------------
// router.post("/register-send-otp", async (req, res) => {
//   const { email, phone, password } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   try {
//     // ሀ. መጀመሪያ ዳታቤዝ ላይ ዳታውን አስቀምጥ
//     await User.findOneAndUpdate(
//       { email },
//       { email, phone, password, otp, isVerified: false },
//       { upsert: true, new: true }
//     );
//     console.log(`✅ DB Updated: ${otp}`);

//     // ለ. 🔑 ወሳኝ፡ ለ Frontend ወዲያውኑ "Success" ምላሽ ስጥ!
//     // ይህ ዌብሳይቱ ሳይቆይ ወደ verify-otp ገጽ እንዲቀየር ያደርገዋል
//     res.status(200).json({
//       success: true,
//       message: "OTP ተፈጥሯል",
//       debugOtp: otp,
//     });

//     // ሐ. ኢሜይሉን ከምላሹ በኋላ 'በጀርባ' እንዲሞክር አዘዝነው
//     // 'await' ስለሌለው ሰርቨሩ አይቆምም
//     transporter
//       .sendMail({
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "Your OTP Code",
//         text: `የእርስዎ ማረጋገጫ ኮድ፡ ${otp}`,
//       })
//       .catch((err) =>
//         console.log("📧 Background Email Error (Timeout):", err.message)
//       );
//   } catch (error) {
//     console.error("❌ DB Error:", error.message);
//     if (!res.headersSent) {
//       res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
//     }
//   }
// });
// ✅ የተስተካከለ Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Port 465 ከሆነ የግድ true መሆን አለበት
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ክፍተት (space) የሌለው App Password መሆኑን አረጋግጥ
  },
  tls: {
    rejectUnauthorized: false, // ለ Render ሰርቨር በጣም አስፈላጊ ነው
  }
});

// ✅ REGISTER & SEND OTP (ማሻሻያ)
router.post("/register-send-otp", async (req, res) => {
  const { email, phone, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await User.findOneAndUpdate(
      { email },
      { email, phone, password, otp, isVerified: false },
      { upsert: true, new: true }
    );

    // 🔑 ለ Frontend ምላሽ ከመስጠትህ በፊት ኢሜይሉ መላኩን እርግጠኛ ሁን
    await transporter.sendMail({
      from: `"Habesha Tel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `የእርስዎ ማረጋገጫ ኮድ፡ ${otp}`,
      html: `<h3> Habesha Tel </h3> <p> ኮድዎ፡ <b>${otp}</b> </p>`
    });

    res.status(200).json({ success: true, message: "OTP ተልኳል" });
  } catch (error) {
    console.error("📧 Email Error:", error.message);
    res.status(500).json({ success: false, message: "ኮድ መላክ አልተቻለም" });
  }
});
// ------------------------------------
// 3. VERIFY OTP
// ------------------------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ success: false, message: "ተጠቃሚው አልተገኘም" });

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ success: true, message: "ማረጋገጫው ተሳክቷል!" });
    } else {
      return res.json({ success: false, message: "የተሳሳተ ኮድ ነው!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

// ------------------------------------
// 4. GET USER
// ------------------------------------
router.get("/user", async (req, res) => {
  try {
    const { phone } = req.query;
    const user = await User.findOne({ phone });

    if (!user)
      return res.status(404).json({ success: false, message: "ተጠቃሚ የለም" });

    res.json({
      success: true,
      user: {
        phone: user.phone,
        minutes: user.minutes || 0,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "የሰርቨር ስህተት" });
  }
});

export default router;
