import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register({ setTempUserEmail, setTempPhone }) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // መጨረሻው ላይ / እንዳይኖር
    const backendUrl = "https://phone-call-backend.onrender.com";

    const sendOtp = async () => {
        if (!email || !phone) return setMessage("❌ መረጃዎችን ያስገቡ");
        setMessage("⏳ በመላክ ላይ...");
        try {
            // ትክክለኛ አድራሻ
           
            // አድራሻውን በትክክል እንዲህ አድርገህ አስተካክል
            const res = await axios.post(`${backendUrl}/api/auth/register-send-otp`, { email, phone });
            if (res.data.success) {
                setTempUserEmail(email);
                setTempPhone(phone);
                navigate("/verify-otp");
            }
        } catch (err) {
            setMessage("❌ ስህተት: " + (err.response?.data?.message || "ሰርቨሩ አልመለሰም"));
        }
    };

    return (
        <div className="flex flex-col p-10">
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 mb-2" />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 mb-2" />
            <button onClick={sendOtp} className="bg-blue-500 text-white p-2">Send OTP</button>
            <p>{message}</p>
        </div>
    );
}
export default Register;