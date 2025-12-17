import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import callRoutes from "./routes/callRoutes.js";
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
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// 🔑 ማስተካከያ፦ በ Render Log የታየውን የ PathError ስህተት ለመፍታት (.*) ተጠቅመናል
app.options("(.*)", cors(corsOptions));

// 3. JSON Body Parser
app.use(express.json());

// 4. Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", callRoutes);

// 5. Health Check
app.get("/", (req, res) => {
  res.send("Backend Server is Running! 🚀");
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
