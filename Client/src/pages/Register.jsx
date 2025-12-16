
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";

// // 🔑 ማስተካከያ 1: setUserPhone ን እንደ prop መቀበል
// function Register({ setUserPhone }) {
//     const [email, setEmail] = useState("");
//     const [phone, setPhone] = useState("");
//     const [otp, setOtp] = useState("");
//     const [otpSent, setOtpSent] = useState(false);
//     const [message, setMessage] = useState("");

//     const navigate = useNavigate();
//     const backendUrl = "https://phone-call-backend.onrender.com";

//     // -------- Send OTP --------
//     const sendOtp = async () => {
//         if (!email || !phone) return setMessage("Email እና Phone አስገባ!");
//         try {
//             const res = await axios.post(`${backendUrl}/register-send-otp`, { email, phone });
//             if (res.data.success) {
//                 setOtpSent(true);
//                 setMessage("✅ OTP ተልኳል! Emailዎን ይፈትሹ።");
//             } else {
//                 setMessage("❌ " + res.data.message);
//             }
//         } catch (err) {
//             setMessage("❌ Server error ወይም Network ችግር");
//         }
//     };

//     // -------- Verify OTP --------
//     const verifyOtp = async () => {
//         if (!otp) return setMessage("OTP አስገባ!");
//         try {
//             // ⚠️ Backendዎ OTP የሚያረጋግጠው በ Email ስለሆነ email እንልካለን
//             const res = await axios.post(`${backendUrl}/verify-otp`, { email, otp });

//             if (res.data.success) {

//                 // ************************************************************
//                 // 🔑 ወሳኝ ማስተካከያ 2: ስልክ ቁጥሩን ወደ App.jsx State መመለስ
//                 if (setUserPhone) {
//                     setUserPhone(phone); // ስልክ ቁጥሩን ይልካል!
//                 }
//                 // ************************************************************

//                 setMessage("✅ " + res.data.message);
//                 setTimeout(() => navigate("/home"), 1000);
//             } else {
//                 setMessage("❌ " + res.data.message);
//             }
//         } catch (err) {
//             setMessage("❌ Server error");
//         }
//     };

//     return (
//         <div className="min-h-screen flex justify-center items-center bg-gray-100">
//             <div className="bg-white shadow-lg p-8 rounded w-96">
//                 <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
//                 <p className="text-red-500 text-center mb-3">{message}</p>

//                 {/* ቅጽበታዊ OTP የማስገቢያ ገጽ */}
//                 {!otpSent && (
//                     <>
//                         <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
//                             value={email} onChange={(e) => setEmail(e.target.value)} />
//                         <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
//                             value={phone} onChange={(e) => setPhone(e.target.value)} />
//                         <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded">Send OTP</button>
//                     </>
//                 )}

//                 {/* OTP የማረጋገጫ ክፍል */}
//                 {otpSent && (
//                     <>
//                         <input type="text" placeholder="OTP" className="border p-2 w-full rounded mb-4"
//                             value={otp} onChange={(e) => setOtp(e.target.value)} />
//                         <button onClick={verifyOtp} className="bg-green-600 text-white w-full py-2 rounded">Verify OTP</button>
//                     </>
//                 )}
//                 <div>
//                     <span>admin</span>
//                     <Link to='/admin'>login</Link>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Register;

// // import { useState } from "react";
// // import axios from "axios";
// // import { useNavigate, Link } from "react-router-dom";

// // // 🔑 ማስተካከያ 1: አዲሶቹን Props እንቀበላለን
// // function Register({ setUserPhone, setTempUserEmail, setTempPhone }) {
// //     const [email, setEmail] = useState("");
// //     const [phone, setPhone] = useState("");
// //      const [otp, setOtp] = useState(""); // ❌ ተወግዷል
// //     const [otpSent, setOtpSent] = useState(false); // ❌ ተወግዷል
// //     const [message, setMessage] = useState("");

// //     const navigate = useNavigate();
// //     const backendUrl = "https://phone-call-backend.onrender.com/api/auth"; // 🔑 End-point ጨምረናል

// //     // -------- Send OTP --------
// //     const sendOtp = async () => {
// //         if (!email || !phone) return setMessage("Email እና Phone አስገባ!");
// //         try {
// //             // ⚠️ ማስታወሻ: Backendዎ Register-Send-OTP ከሚለው ይልቅ Register ን ብቻ ሊጠቀም ይችላል።
// //             // እዚህ ላይ በትክክለኛው End-point ተጠቅመናል: /api/auth/register-send-otp
// //             const res = await axios.post(`${backendUrl}/register-send-otp`, { email, phone });

// //             if (res.data.success) {
// //                 // ************************************************************
// //                 // 🔑 ወሳኝ ማስተካከያ 2: መረጃውን ወደ App.jsx States መላክ!
// //                 setTempUserEmail(email);
// //                 setTempPhone(phone);
// //                 // ************************************************************

// //                 setMessage("✅ OTP ተልኳል! ወደ ማረጋገጫ ገጽ እየሄድን ነው...");

// //                 // 🔑 ወሳኝ ማስተካከያ 3: ወደ VerifyOtp ገጽ መሄድ!
// //                 setTimeout(() => navigate("/verify-otp"), 1000);

// //             } else {
// //                 setMessage("❌ " + res.data.message);
// //             }
// //         } catch (err) {
// //             const errorMessage = err.response?.data?.message || "Server error ወይም Network ችግር";
// //             setMessage("❌ " + errorMessage);
// //         }
// //     };

// //     // -------- Verify OTP ተግባር ተወግዷል --------
// //     // ...

// //     return (
// //         <div className="min-h-screen flex justify-center items-center bg-gray-100">
// //             <div className="bg-white shadow-lg p-8 rounded w-96">
// //                 <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
// //                 <p className="text-red-500 text-center mb-3">{message}</p>

// //                 {/* አሁን OTP Sent የሚለው State ስለተወገደ፣ ይህ ሁልጊዜ ይታያል። */}
// //                 <>
// //                     <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
// //                         value={email} onChange={(e) => setEmail(e.target.value)} />
// //                     <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
// //                         value={phone} onChange={(e) => setPhone(e.target.value)} />
// //                     <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded">Send OTP</button>
// //                 </>

// //                 {/* የ OTP የማረጋገጫ ክፍል ተወግዷል */}
// //                 {/* {otpSent && (...) } */}

// //                 <div className="mt-4 text-center">
// //                     <span>Admin? </span>
// //                     <Link to='/admin' className="text-blue-600 hover:underline font-medium">Login</Link>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }

// // export default Register;

import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// 🔑 አዲሶቹን Props እንቀበላለን (ከ App.jsx ላይ)
function Register({ setUserPhone, setTempUserEmail, setTempPhone }) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    // 🔑 Base URL ብቻ
    const backendUrl = "https://phone-call-backend.onrender.com";

    // -------- Send OTP (404 Error Fix) --------
    const sendOtp = async () => {
        if (!email || !phone) return setMessage("Email እና Phone አስገባ!");
        setMessage("OTP በመላክ ላይ...");
        try {
            // ✅ 404 ስህተትን ለመፍታት ትክክለኛው መንገድ: /api/auth Base URL ተጨምሯል
            const res = await axios.post(`${backendUrl}/api/auth/register-send-otp`, { email, phone });

            if (res.data.success) {
                // 🔑 መረጃውን ወደ App.jsx States መላክ!
                if (setTempUserEmail && setTempPhone) {
                    setTempUserEmail(email);
                    setTempPhone(phone);
                }

                setMessage("✅ OTP ተልኳል! ወደ ማረጋገጫ ገጽ እየሄድን ነው።");

                // 🔑 ወደ VerifyOtp ገጽ መሄድ (በ App.jsx ላይ ያለውን Route በመጠቀም)
                setTimeout(() => navigate("/verify-otp"), 1000);

            } else {
                setMessage("❌ " + res.data.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Server error ወይም Network ችግር";
            setMessage("❌ " + errorMessage);
        }
    };

    // ** Verify OTP ተግባር ከዚህ ገጽ ሙሉ በሙሉ ተወግዷል **

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white shadow-lg p-8 rounded w-96">
                <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
                <p className="text-red-500 text-center mb-3">{message}</p>

                {/* የመመዝገቢያ ቅጽ (OTP ከተላከ በኋላ ምንም ነገር አይደብቅም) */}
                <>
                    <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
                        value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded">Send OTP</button>
                </>

                <div className="mt-4 text-center">
                    <span>Admin? </span>
                    <Link to='/admin' className="text-blue-600 hover:underline font-medium">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;