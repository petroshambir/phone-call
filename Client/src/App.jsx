import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyOtp from "./pages/VerifyOtp";
import Home from "./pages/Home";
import { useState } from "react";
import { Navigate } from "react-router-dom";

function App() {
  const [userPhone, setUserPhone] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const isAuthenticated = userPhone !== null;

  return (
    <BrowserRouter>
      <Routes>

        {/* 1. Register Page: setUserPhone ን እንልካለን */}
        <Route
          path="/"
          element={<Register setUserPhone={setUserPhone} />} // 🔑 ወሳኝ ማስተካከያ!
        />

        {/* 2. Verify OTP Page: Register Logic ወደዚህ ስለማይልክ ይህ Route አሁን አያስፈልግም/ባዶ ነው */}
        <Route
          path="/verify-otp"
          element={<div>ይህ ገጽ በአሁን ጊዜ አይጠራም</div>}
        />

        {/* 3. Home Page: ስልክ ቁጥሩን እንደ prop እንልካለን */}
        <Route
          path="/home"
          element={
            isAuthenticated
              ? <Home phone={userPhone} /> // ✅ Home አሁን phone={"+251..."} ይቀበላል
              : <Navigate to="/" replace />
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated} />}
        />

        <Route
          path="/admin/dashboard"
          element={
            isAdminAuthenticated
              ? <AdminDashboard />
              : <Navigate to="/admin" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;