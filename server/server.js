import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// CORS Configuration
app.use(
  cors({
    origin: [
      "https://phone-call-frontend.onrender.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("Habesha Tel Backend is Live! 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
