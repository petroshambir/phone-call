
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// 🔑 ማስተካከያ 1: setUserPhone ን እንደ prop መቀበል
function Register({ setUserPhone }) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const backendUrl = "http://localhost:5000/api/auth";

    // -------- Send OTP --------
    const sendOtp = async () => {
        if (!email || !phone) return setMessage("Email እና Phone አስገባ!");
        try {
            const res = await axios.post(`${backendUrl}/register-send-otp`, { email, phone });
            if (res.data.success) {
                setOtpSent(true);
                setMessage("✅ OTP ተልኳል! Emailዎን ይፈትሹ።");
            } else {
                setMessage("❌ " + res.data.message);
            }
        } catch (err) {
            setMessage("❌ Server error ወይም Network ችግር");
        }
    };

    // -------- Verify OTP --------
    const verifyOtp = async () => {
        if (!otp) return setMessage("OTP አስገባ!");
        try {
            // ⚠️ Backendዎ OTP የሚያረጋግጠው በ Email ስለሆነ email እንልካለን
            const res = await axios.post(`${backendUrl}/verify-otp`, { email, otp });

            if (res.data.success) {

                // ************************************************************
                // 🔑 ወሳኝ ማስተካከያ 2: ስልክ ቁጥሩን ወደ App.jsx State መመለስ
                if (setUserPhone) {
                    setUserPhone(phone); // ስልክ ቁጥሩን ይልካል!
                }
                // ************************************************************

                setMessage("✅ " + res.data.message);
                setTimeout(() => navigate("/home"), 1000);
            } else {
                setMessage("❌ " + res.data.message);
            }
        } catch (err) {
            setMessage("❌ Server error");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white shadow-lg p-8 rounded w-96">
                <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
                <p className="text-red-500 text-center mb-3">{message}</p>

                {/* ቅጽበታዊ OTP የማስገቢያ ገጽ */}
                {!otpSent && (
                    <>
                        <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
                            value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded">Send OTP</button>
                    </>
                )}

                {/* OTP የማረጋገጫ ክፍል */}
                {otpSent && (
                    <>
                        <input type="text" placeholder="OTP" className="border p-2 w-full rounded mb-4"
                            value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <button onClick={verifyOtp} className="bg-green-600 text-white w-full py-2 rounded">Verify OTP</button>
                    </>
                )}
                <div>
                    <span>admin</span>
                    <Link to='/admin'>login</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;