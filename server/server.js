// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import callRoutes from "./routes/callRoutes.js";
// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";

// const app = express();

// // 1. MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected Successfully"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // 2. CORS Configuration
// const corsOptions = {
//   origin: ["https://phone-call-frontend.onrender.com", "http://localhost:5173"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };

// app.use(cors(corsOptions));

// // 3. Body Parsers (ጠቃሚ ማስተካከያ)
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // Twilio ለሚልከው ዳታ የግድ ያስፈልጋል

// // 4. Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api", callRoutes);

// // 5. Health Check
// app.get("/", (req, res) => {
//   res.send("Backend Server is Running! 🚀");
// });

// // 6. Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🔥 Server running on port ${PORT}`);
// });

import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"; // ያንተ ፋይል ስም
import adminRoutes from "./routes/adminRoutes.js";
import callRoutes from "./routes/callRoutes.js";
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
// እዚህ ጋር በደንብ አስተውል!
app.use("/api/auth", authRoutes); // ይህ ለ Login/Register/OTP ይሆናል
app.use("/api", authRoutes); // ይህ ለ /call-user እንዲሰራ ያደርገዋል (404 እንዳይመጣ)
app.use("/api/admin", adminRoutes);
app.use("/api", callRoutes);

// 5. Health Check
app.get("/", (req, res) => {
  res.send("Habesha Tel Backend is Live! 🚀");
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});