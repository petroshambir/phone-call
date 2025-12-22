import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = ({ setTempUserEmail }) => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        try {
            // ዳታውን በ Object {email, phone} መልክ መላክ
            const res = await axios.post("https://phone-call-backend.onrender.com/api/auth/register-send-otp", {
                email,
                phone
            });

            if (res.data.success) {
                setTempUserEmail(email);
                navigate("/verify-otp");
            }
        } catch (err) {
            alert(err.response?.data?.message || "ስህተት ተፈጥሯል");
        }
    };

    return (
        <div>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="Phone" onChange={(e) => phone(e.target.value)} />
            <button onClick={handleSendOtp}>Send OTP</button>
        </div>
    );
};
export default Register;