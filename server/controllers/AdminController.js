
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// /api/admin-login
router.post("/admin-login", (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ success: true, message: "Admin login successful" });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
});

export default router;
