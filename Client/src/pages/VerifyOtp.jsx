// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function VerifyOtp({ setUserPhone, userEmail, phone }) {
//     const [otp, setOtp] = useState("");
//     const [errorMsg, setErrorMsg] = useState("");
//     const navigate = useNavigate();

//     // Backend URL
//     const backendUrl = "https://phone-call-backend.onrender.com/api/verify-otp";
//     useEffect(() => {
//         // ኢሜይል ከሌለ ተጠቃሚው በስህተት ነው እዚህ ገጽ የመጣው ማለት ነው
//         if (!userEmail) {
//             setErrorMsg("❌ Email አልተገኘም! እባክህ መጀመሪያ ተመዝገብ።");
//         }
//     }, [userEmail]);

//     const handleVerify = async () => {
//         if (!otp || otp.length !== 6) {
//             setErrorMsg("ትክክለኛ 6 አሃዝ OTP ያስገቡ");
//             return;
//         }

//         try {
//             const res = await axios.post(backendUrl, {
//                 email: userEmail,
//                 otp: otp
//             });

//             if (res.data.success) {
//                 alert("✅ OTP Verified Successfully!");

//                 // ስልኩን ወደ App.jsx ስቴት እንመልሰው (Login እንዲሆን)
//                 if (phone && setUserPhone) {
//                     setUserPhone(phone);
//                 }

//                 // ወደ Home ገጽ እንላክ
//                 navigate("/home");
//             } else {
//                 setErrorMsg("❌ አልተሳካም: " + res.data.message);
//             }
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || "አገናኝ ስህተት ወይም Server ችግር";
//             setErrorMsg("❌ አልተሳካም: " + errorMessage);
//         }
//     };

//     return (
//         <div style={{
//             minHeight: '100vh',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             backgroundColor: '#f3f4f6'
//         }}>
//             <div style={{
//                 backgroundColor: 'white',
//                 padding: '40px',
//                 borderRadius: '8px',
//                 boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                 width: '100%',
//                 maxWidth: '400px',
//                 textAlign: 'center'
//             }}>
//                 <h2 style={{ marginBottom: '20px', fontWeight: 'bold' }}>📞 OTP ማረጋገጫ</h2>

//                 {errorMsg && (
//                     <div style={{
//                         color: '#721c24',
//                         backgroundColor: '#f8d7da',
//                         padding: '10px',
//                         borderRadius: '5px',
//                         marginBottom: '15px',
//                         fontSize: '14px'
//                     }}>
//                         {errorMsg}
//                     </div>
//                 )}

//                 <p style={{ marginBottom: '20px', color: '#666' }}>
//                     ለ <strong>{userEmail || "ኢሜይልዎ"}</strong> የተላከውን ኮድ ያስገቡ።
//                 </p>

//                 <input
//                     type="text"
//                     placeholder="6-አሃዝ ኮድ"
//                     maxLength="6"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     style={{
//                         padding: '12px',
//                         width: '100%',
//                         border: '1px solid #ccc',
//                         borderRadius: '4px',
//                         textAlign: 'center',
//                         fontSize: '20px',
//                         letterSpacing: '5px',
//                         marginBottom: '20px',
//                         display: 'block'
//                     }}
//                 />

//                 <button
//                     onClick={handleVerify}
//                     style={{
//                         width: '100%',
//                         padding: '12px',
//                         backgroundColor: '#007bff',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         cursor: 'pointer',
//                         fontWeight: 'bold',
//                         fontSize: '16px'
//                     }}
//                 >
//                     ✅ አረጋግጥ (Verify)
//                 </button>

//                 <p style={{ marginTop: '20px', fontSize: '13px', color: '#888' }}>
//                     የተመዘገበ ስልክ: {phone || "ያልተገኘ"}
//                 </p>
//             </div>
//         </div>
//     );
// }

// export default VerifyOtp;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyOtp({ setUserPhone, userEmail, phone }) {
    const [otp, setOtp] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    // ✅ በትክክል የተስተካከለ Backend URL (ያለ /auth/)
    const backendUrl = "https://phone-call-backend.onrender.com/api/verify-otp";

    useEffect(() => {
        if (!userEmail) {
            setErrorMsg("❌ Email አልተገኘም! እባክህ መጀመሪያ ተመዝገብ።");
        }
    }, [userEmail]);

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            setErrorMsg("⚠️ ትክክለኛ 6 አሃዝ OTP ያስገቡ");
            return;
        }

        try {
            const res = await axios.post(backendUrl, {
                email: userEmail,
                otp: otp
            });

            if (res.data.success) {
                alert("✅ ማረጋገጫው ተሳክቷል!");

                if (phone && setUserPhone) {
                    setUserPhone(phone);
                }

                navigate("/home"); // ወደ ዋናው ገጽ ይወስደዋል
            } else {
                setErrorMsg("❌ " + res.data.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "የሰርቨር ግንኙነት ተቋርጧል።";
            setErrorMsg("❌ " + errorMessage);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '10px', color: '#1f2937' }}>📞 OTP ማረጋገጫ</h2>
                <p style={{ marginBottom: '25px', color: '#6b7280', fontSize: '14px' }}>
                    ለ <strong>{userEmail || "ኢሜይልዎ"}</strong> የተላከውን ኮድ ያስገቡ።
                </p>

                {errorMsg && (
                    <div style={{
                        color: '#b91c1c',
                        backgroundColor: '#fee2e2',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: '1px solid #fecaca'
                    }}>
                        {errorMsg}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{
                        padding: '15px',
                        width: '100%',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        letterSpacing: '8px',
                        marginBottom: '25px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />

                <button
                    onClick={handleVerify}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                    ✅ አረጋግጥ (Verify)
                </button>

                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                        የተመዘገበ ስልክ: <span style={{ color: '#4b5563' }}>{phone || "ያልተገኘ"}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;