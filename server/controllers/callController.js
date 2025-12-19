import Zadarma from "zadarma";
import User from "../models/userModel.js";

const api = new Zadarma({
  key: process.env.ZADARMA_KEY,
  secret: process.env.ZADARMA_SECRET,
});

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
    const user = await User.findOne({ phone: clientPhoneNumber });

    if (!user || user.minutes < REQUIRED_MINUTES_PER_CALL) {
      return res.status(403).json({
        success: false,
        message: "በቂ ደቂቃ የለዎትም! እባክዎ ቀሪ ሂሳብዎን ይሙሉ።",
      });
    }

    // Zadarma Callback
    api.request(
      "/v1/request/callback/",
      {
        from: clientPhoneNumber,
        to: userPhone,
      },
      async (err, data) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Zadarma Error" });
        }

        const response = typeof data === "string" ? JSON.parse(data) : data;

        if (response.status === "success") {
          user.minutes -= REQUIRED_MINUTES_PER_CALL;
          await user.save();
          res.status(200).json({
            success: true,
            message: "ጥሪው እየተሞከረ ነው!",
            minutesRemaining: user.minutes,
          });
        } else {
          res.status(400).json({ success: false, message: response.message });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
