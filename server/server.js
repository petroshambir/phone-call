import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import callRoutes from "./routes/callRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const corsOptions = {
  origin: ["https://phone-call-frontend.onrender.com", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// 🔑 ማስተካከያ፡ በሎጉ የታየውን PathError ለመፍታት ኮከቧን እንዲህ ቀይረነዋል
app.options("(.*)", cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", callRoutes);

app.get("/", (req, res) => {
  res.send("Backend Server is Running! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
