import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// 1. መጀመሪያ JSON ማንበቢያ ይግባ (ይህ ከሌለ 400 Error ይመጣል)
app.use(express.json());
app.use(cors());

// 2. ከዛ Routes ይከተሉ
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB ተገናኝቷል"))
  .catch((err) => console.log("❌ DB Error:", err));

app.listen(process.env.PORT || 5000, () => console.log("🚀 Server Started"));
