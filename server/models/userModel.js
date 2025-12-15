
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  minutes: { type: Number, default: 0 }, // 🔑 ደቂቃውን እንደ Number አስቀምጥ
});

const User = mongoose.model("User", userSchema);
export default User;