import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors({ origin: "*" })); // ለማንኛውም ፍሮንት እንዲሰራ እንዲህ ማድረጉ ይቀላል
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

app.listen(process.env.PORT || 5000, () => console.log("🚀 Server Ready"));
