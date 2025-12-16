
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// // 🔑 ማስተካከያ 1: setUserPhone ን እና phone ን እንደ prop መቀበል
// function VerifyOtp({ setUserPhone, userEmail, phone }) {
//     const [otp, setOtp] = useState("");
//     const [errorMsg, setErrorMsg] = useState("");
//     const navigate = useNavigate();

//     // ⚠️ ማስታወሻ: phone የሚለው prop ከ Register ሲመጣ፣ እዚህም መኖር አለበት።
//     // ነገር ግን፣ Backend'ዎ OTPን የሚያረጋግጠው በ Email ስለሆነ, ከ Register የመጣውን Email እንጠቀም.

//     // 🔑 ማስተካከያ: ስልክ ቁጥር ከ Register ካልመጣ በቀጥታ ወደ Home መላክ (የሚፈልጉት ከሆነ)

//     useEffect(() => {
//         // ይህ የ OTP ማረጋገጫ ገጽ ነው, ስለዚህ ሁልጊዜ ስልክ ቁጥሩን ከ Register.jsx ወይም ከሌላ ቦታ መምጣቱን ያረጋግጡ
//         if (!userEmail) {
//             setErrorMsg("❌ Email አልተገኘም! ወደ መግቢያ ገጽ ይመለሱ.");
//             // navigate("/"); // ወደ መመዝገቢያ ይመልሳል
//         }
//     }, [userEmail]);


//     const handleVerify = async () => {
//         if (!otp || otp.length !== 6) {
//             setErrorMsg("ትክክለኛ 6 አሃዝ OTP ያስገቡ");
//             return;
//         }

//         try {
//             const res = await fetch("https://phone-call-backend.onrender.com", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 // ⚠️ Backend ዎ በ OTP እና Email ስለሚያረጋግጥ፣ email እንልካለን
//                 body: JSON.stringify({ email: userEmail, otp })
//             });

//             const data = await res.json();

//             if (data.success) {
//                 alert("✅ OTP Verified Successfully!");

//                 // ************************************************************
//                 // 🔑 ወሳኝ ማስተካከያ 2: ስልክ ቁጥሩን ወደ App.jsx State መመለስ
//                 // ይህ እርምጃ Home Component ን ያነቃቃል!
//                 // ************************************************************
//                 if (phone && setUserPhone) {
//                     setUserPhone(phone); // ስልክ ቁጥሩን ወደ App.jsx ይመልሳል
//                 } else {
//                     // እንደ አማራጭ: ስልኩን ከ Backend መልስ መውሰድ ከፈለጉ
//                     // አሁን ባለው Auth Route መልሱ ላይ phone ስለሌለ, phone ከ Register.jsx መምጣት አለበት.
//                     console.error("Phone prop or setUserPhone function is missing.");
//                 }

//                 // ወደ Homepage ይሂድ (App.jsx ወደ Home ከመግባቱ በፊት isAuthenticated ን ያረጋግጣል)
//                 navigate("/home");

//             } else {
//                 setErrorMsg("❌ አልተሳካም: " + data.message);
//             }
//         } catch (err) {
//             setErrorMsg("❌ አገናኝ ስህተት ወይም Server ችግር");
//             console.error("Verification Error:", err);
//         }
//     };

//     return (
//         <div style={{ padding: 20, textAlign: 'center' }}>
//             <h2 style={{ marginBottom: 20 }}>📞 OTP አስገባ</h2>

//             {errorMsg && (
//                 <div style={{ color: 'red', marginBottom: 15, border: '1px solid red', padding: 10, borderRadius: 5 }}>
//                     {errorMsg}
//                 </div>
//             )}

//             <p style={{ marginBottom: 10 }}>ኮዱን ወደ **{userEmail || "የእርስዎ ኢሜይል"}** ልከናል.</p>

//             <input
//                 type="text"
//                 placeholder="6-digit OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 style={{ padding: 10, width: "200px", border: '1px solid #ccc', borderRadius: 4 }}
//             />

//             <button
//                 onClick={handleVerify}
//                 style={{ marginLeft: 10, padding: 10, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
//             >
//                 ✅ Verify
//             </button>

//             <p style={{ marginTop: 20, fontSize: 'small', color: '#666' }}>
//                 ለማረጋገጥ የሚጠቀሙት ስልክ: **{phone || "ያልተገኘ"}**
//             </p>
//         </div>
//     );
// }

// export default VerifyOtp;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 🔑 Axios ታክሏል

// 🔑 props በትክክል እየተቀበሉ ነው: { setUserPhone, userEmail, phone }
function VerifyOtp({ setUserPhone, userEmail, phone }) {
    const [otp, setOtp] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    // 🔑 Render Backend URL ከ End-point ጋር
    const backendUrl = "https://phone-call-backend.onrender.com/api/auth/verify-otp"; // 🔑 ትክክለኛ End-point!

    useEffect(() => {
        if (!userEmail) {
            setErrorMsg("❌ Email አልተገኘም! ወደ መመዝገቢያ ገጽ ይመለሱ.");
            // navigate("/"); // ወዲያውኑ ወደ መመዝገቢያ መላክ ይችላሉ
        }
    }, [userEmail]);


    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            setErrorMsg("ትክክለኛ 6 አሃዝ OTP ያስገቡ");
            return;
        }

        try {
            // 🔑 ማስተካከያ: Axios ን ከትክክለኛው URL ጋር መጠቀም
            const res = await axios.post(backendUrl, {
                email: userEmail, // ከ App.jsx እንደ Prop የመጣው
                otp: otp
            });

            const data = res.data; // 🔑 ለ Axios, መልሱ በ res.data ውስጥ ነው ያለው

            if (data.success) {
                alert("✅ OTP Verified Successfully!");

                // 🔑 ወሳኝ ማስተካከያ: ስልክ ቁጥሩን ወደ App.jsx State መመለስ
                if (phone && setUserPhone) {
                    setUserPhone(phone);
                } else {
                    console.error("Phone prop or setUserPhone function is missing.");
                }

                navigate("/home");

            } else {
                setErrorMsg("❌ አልተሳካም: " + data.message);
            }
        } catch (err) {
            // 🔑 ለ Axios የተሻሻለ የስህተት አያያዝ
            const errorMessage = err.response?.data?.message || "አገናኝ ስህተት ወይም Server ችግር";
            setErrorMsg("❌ አልተሳካም: " + errorMessage);
            console.error("Verification Error:", err);
        }
    };

    return (
        <div style={{ padding: 20, textAlign: 'center' }}>
            {/* ... (ቀሪው የ HTML/JSX ኮድ ተመሳሳይ ነው) ... */}
        </div>
    );
}

export default VerifyOtp;