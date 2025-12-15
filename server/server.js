
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import callRoutes from "./routes/callRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // ለ OTP እና Get User Minutes
import adminRoutes from "./routes/adminRoutes.js"; // ለአድሚን ተግባራት (ደቂቃ መጨመርን ጨምሮ)

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

// JSON Body Parser
app.use(express.json());

// Routes
// /api/auth/user (ደቂቃውን ለ Home Page የሚልከው)
app.use("/api/auth", authRoutes);
// /api/admin/add-minutes (አድሚን ደቂቃ የሚጨምርበት)
app.use("/api/admin", adminRoutes);
app.use("/api", callRoutes);
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));