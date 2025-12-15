
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔑 setIsAdminAuthenticated ን እንደ prop እንቀበላለን
function AdminLogin({ setIsAdminAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000/api/admin";

  const handleLogin = async () => {
    if (!email || !password) return setMessage("Email እና Password አስገባ");

    try {
      const res = await axios.post(`${backendUrl}/admin-login`, { email, password });

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);

        // ******************************************************
        // 🔑 ወሳኝ ማስተካከያ: Global Stateን ወደ true እናደርጋለን!
        setIsAdminAuthenticated(true);
        // ******************************************************

        setMessage(res.data.message);
        navigate("/admin/dashboard");
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      setMessage("Server error");
      console.error("Admin Login Error:", error);
    }
  };

  // ... (ቀሪው የ return ኮድ ተመሳሳይ ነው) ...
  return (
    
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
      //       <div className="bg-white p-6 shadow-md rounded w-80">
      //         <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>

      //         <p className="text-center text-red-500 mb-3">{message}</p>

            {/* 🔑 Email Input Field */}
           <input
                type="email"
                placeholder="Admin Email"
                className="border p-2 w-full mb-4"
                value={email} // State ን ማገናኘት
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password Input Field */}
              <input
                type="password"
                placeholder="Admin Password"
                className="border p-2 w-full mb-4"
                value={password} // State ን ማገናኘት
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                Login
              </button>
            </div>
           </div>
    </div>
  );
}

export default AdminLogin;