import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// 1. MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 2. CORS Configuration
const corsOptions = {
  origin: ["https://phone-call-frontend.onrender.com", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// 3. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Routes
// ጥሪ እና OTP በ authRoutes በኩል እንዲሰሩ ተደርገዋል
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

// 5. Health Check
app.get("/", (req, res) => {
  res.send("Habesha Tel Backend is Live! 🚀");
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
