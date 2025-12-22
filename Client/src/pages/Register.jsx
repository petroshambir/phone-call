
// // import { useState } from "react";
// // import axios from "axios";
// // import { useNavigate, Link } from "react-router-dom";

// // // 🔑 አዲሶቹን Props እንቀበላለን (ከ App.jsx ላይ)
// // function Register({ setUserPhone, setTempUserEmail, setTempPhone }) {
// //     const [email, setEmail] = useState("");
// //     const [phone, setPhone] = useState("");
// //     const [message, setMessage] = useState("");

// //     const navigate = useNavigate();
// //     // 🔑 Base URL ብቻ
// //     const backendUrl = "https://phone-call-backend.onrender.com";

// //     // -------- Send OTP (404 Error Fix) --------
// //     const sendOtp = async () => {
// //         if (!email || !phone) return setMessage("Email እና Phone አስገባ!");
// //         setMessage("OTP በመላክ ላይ...");
// //         try {
// //             // ✅ ትክክለኛው መንገድ: /api/auth Base URL ተጨምሯል
// //             const res = await axios.post(`${backendUrl}/api/auth/register-send-otp`, { email, phone });

// //             if (res.data.success) {
// //                 // 🔑 መረጃውን ወደ App.jsx States መላክ!
// //                 if (setTempUserEmail && setTempPhone) {
// //                     setTempUserEmail(email);
// //                     setTempPhone(phone);
// //                 }

// //                 setMessage("✅ OTP ተልኳል! ወደ ማረጋገጫ ገጽ እየሄድን ነው።");

// //                 // 🔑 ማስተካከያ፡ setTimeout ተወግዷል፤ ወዲያውኑ ወደ OTP ገጽ ሂድ
// //                 navigate("/verify-otp");

// //             } else {
// //                 setMessage("❌ " + res.data.message);
// //             }
// //         } catch (err) {
// //             const errorMessage = err.response?.data?.message || "Server error ወይም Network ችግር";
// //             setMessage("❌ " + errorMessage);
// //         }
// //     };

// //     // ** Verify OTP ተግባር ከዚህ ገጽ ሙሉ በሙሉ ተወግዷል **

// //     return (
// //         <div className="min-h-screen flex justify-center items-center bg-gray-100">
// //             <div className="bg-white shadow-lg p-8 rounded w-96">
// //                 <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
// //                 <p className="text-red-500 text-center mb-3">{message}</p>

// //                 {/* የመመዝገቢያ ቅጽ (OTP ከተላከ በኋላ ምንም ነገር አይደብቅም) */}
// //                 <>
// //                     <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
// //                         value={email} onChange={(e) => setEmail(e.target.value)} />
// //                     <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
// //                         value={phone} onChange={(e) => setPhone(e.target.value)} />
// //                     <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded">Send OTP</button>
// //                 </>

// //                 <div className="mt-4 text-center">
// //                     <span>Admin? </span>
// //                     <Link to='/admin' className="text-blue-600 hover:underline font-medium">Login</Link>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }

// // export default Register;

// import { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";

// function Register({ setUserPhone, setTempUserEmail, setTempPhone }) {
//     const [email, setEmail] = useState("");
//     const [phone, setPhone] = useState("");
//     const [message, setMessage] = useState("");

//     const navigate = useNavigate();
//     const backendUrl = "https://phone-call-backend.onrender.com";
//     // በትክክል እንዲህ መሆኑን አረጋግጥ
//     const res =  axios.post(`${backendUrl}/api/register-send-otp`, { email, phone });
//     // const sendOtp = async () => {
//     //     if (!email || !phone) return setMessage("Email እና Phone አስገባ!");
//     //     setMessage("OTP በመላክ ላይ...");

//     //     try {
//     //         // 🔑 ሰርቨሩ በ 5 ሰከንድ ውስጥ ካልመለሰ ስህተት እንዲሰጥ እናደርጋለን
//     //         const res = await axios.post(`${backendUrl}/api/auth/register-send-otp`,
//     //             { email, phone },
//     //             { timeout: 5000 }
//     //         );

//     //         if (res.data.success) {
//     //             setTempUserEmail(email);
//     //             setTempPhone(phone);
//     //             navigate("/verify-otp");
//     //         }
//     //     } catch (err) {
//     //         // 🔑 ሰርቨሩ ቢዘገይም እንኳ ዳታቤዝ ውስጥ መግባቱን ስለምናውቅ ወደ OTP ገጽ ሂድ
//     //         console.log("Redirecting to OTP page due to server delay...");
//     //         setTempUserEmail(email);
//     //         setTempPhone(phone);
//     //         navigate("/verify-otp");
//     //     }
//     // };
//     const sendOtp = async () => {
//         if (!email || !phone) return setMessage("Email እና Phone አስገባ!");
//         setMessage("OTP በመላክ ላይ...");
//         try {
//             const res = await axios.post(`${backendUrl}/api/register-send-otp`, { email, phone });

//             if (res.data.success) {
//                 setTempUserEmail(email);
//                 setTempPhone(phone);
//                 navigate("/verify-otp");
//             } else {
//                 setMessage("❌ " + res.data.message);
//             }
//         } catch (err) {
//             console.error(err);
//             setMessage("❌ ኢሜይል መላክ አልተቻለም። እባክዎ App Password በትክክል መሙላትዎን ያረጋግጡ።");
//         }
//     };

//     return (
//         <div className="min-h-screen flex justify-center items-center bg-gray-100">
//             <div className="bg-white shadow-lg p-8 rounded w-96">
//                 <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
//                 <p className="text-red-500 text-center mb-3 text-sm">{message}</p>

//                 <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
//                     value={email} onChange={(e) => setEmail(e.target.value)} />
//                 <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
//                     value={phone} onChange={(e) => setPhone(e.target.value)} />

//                 <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded font-bold hover:bg-blue-700 transition">
//                     Send OTP
//                 </button>

//                 <div className="mt-4 text-center">
//                     <span>Admin? </span>
//                     <Link to='/admin' className="text-blue-600 hover:underline font-medium">Login</Link>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Register;

// import { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";

// function Register({ setUserPhone, setTempUserEmail, setTempPhone }) {
//     const [email, setEmail] = useState("");
//     const [phone, setPhone] = useState("");
//     const [message, setMessage] = useState("");

//     const navigate = useNavigate();
//     const backendUrl = "https://phone-call-backend.onrender.com";

//     const sendOtp = async () => {
//         if (!email || !phone) return setMessage("❌ Email እና Phone ያስገባ!");
//         setMessage("⏳ OTP በመላክ ላይ...");
//         try {
//             // ✅ በትክክል በፈንክሽኑ ውስጥ መሆን አለበት
//             const res = await axios.post(`${backendUrl}/api/register-send-otp`, { email, phone });

//             if (res.data.success) {
//                 setTempUserEmail(email);
//                 setTempPhone(phone);
//                 navigate("/verify-otp");
//             } else {
//                 setMessage("❌ " + res.data.message);
//             }
//         } catch (err) {
//             console.error(err);
//             setMessage("❌ ስህተት ተፈጥሯል። ሰርቨሩን ወይም ኢንተርኔትዎን ያረጋግጡ።");
//         }
//     };

//     return (
//         <div className="min-h-screen flex justify-center items-center bg-gray-100">
//             <div className="bg-white shadow-lg p-8 rounded w-96">
//                 <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
//                 <p className="text-red-500 text-center mb-3 text-sm">{message}</p>

//                 <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
//                     value={email} onChange={(e) => setEmail(e.target.value)} />
//                 <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
//                     value={phone} onChange={(e) => setPhone(e.target.value)} />

//                 <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded font-bold hover:bg-blue-700 transition">
//                     Send OTP
//                 </button>
//             </div>
//         </div>
//     );
// }
// export default Register;

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register({ setTempUserEmail, setTempPhone }) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const backendUrl = "https://phone-call-backend.onrender.com";

    const sendOtp = async () => {
        if (!email || !phone) return setMessage("❌ Email እና Phone ያስገባ!");
        setMessage("⏳ OTP በመላክ ላይ...");
        try {
            // ✅ አሁን በትክክል በፈንክሽኑ ውስጥ ነው ያለው
            const res = await axios.post(`${backendUrl}/api/register-send-otp`, { email, phone });

            if (res.data.success) {
                setTempUserEmail(email);
                setTempPhone(phone);
                navigate("/verify-otp");
            }
        } catch (err) {
            setMessage("❌ ስህተት: " + (err.response?.data?.message || "ሰርቨር አልተገኘም"));
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white shadow-lg p-8 rounded w-96">
                <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
                <p className="text-red-500 text-center mb-3 text-sm">{message}</p>
                <input type="email" placeholder="Email" className="border p-2 w-full rounded mb-4"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" placeholder="Phone" className="border p-2 w-full rounded mb-4"
                    value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button onClick={sendOtp} className="bg-blue-600 text-white w-full py-2 rounded font-bold">
                    Send OTP
                </button>
            </div>
        </div>
    );
}
export default Register;