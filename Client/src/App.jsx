
//  import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Register from "./pages/Register";
// import AdminLogin from "./pages/AdminLogin";
// import AdminDashboard from "./pages/AdminDashboard";
// import VerifyOtp from "./pages/VerifyOtp";
// import Home from "./pages/Home";
// import { useState } from "react";
// //  import { Navigate } from "react-router-dom";

// function App() {
//   const [userPhone, setUserPhone] = useState(null);
//   const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

//   const isAuthenticated = userPhone !== null;

//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* 1. Register Page: setUserPhone ን እንልካለን */}
//         <Route
//           path="/"
//           element={<Register setUserPhone={setUserPhone} />} // 🔑 ወሳኝ ማስተካከያ!
//         />

//         {/* 2. Verify OTP Page: Register Logic ወደዚህ ስለማይልክ ይህ Route አሁን አያስፈልግም/ባዶ ነው */}
//         <Route
//           path="/verify-otp"
//           element={
//             <VerifyOtp
//               setUserPhone={setUserPhone}
//               userEmail={tempUserEmail} // 🔑 አዲስ
//               phone={tempPhone}>

//               </VerifyOtp>
//           }
//           // element={<div>ይህ ገጽ በአሁን ጊዜ አይጠራም</div>}
//         />

//         {/* 3. Home Page: ስልክ ቁጥሩን እንደ prop እንልካለን */}
//         <Route
//           path="/home"
//           element={
//             isAuthenticated
//               ? <Home phone={userPhone} /> // ✅ Home አሁን phone={"+251..."} ይቀበላል
//               : <Navigate to="/" replace />
//           }
//         />

//         {/* Admin Routes */}
//         <Route
//           path="/admin"
//           element={<AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated} />}
//         />

//         <Route
//           path="/admin/dashboard"
//           element={
//             isAdminAuthenticated
//               ? <AdminDashboard />
//               : <Navigate to="/admin" replace />
//           }
//         />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

// App.jsx ውስጥ ማስተካከያ

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import Home from "./pages/Home.jsx";
import { useState } from "react";
function App() {
  const [userPhone, setUserPhone] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // 🔑 አዲስ ስቴት (State) እንጨምር
  const [tempUserEmail, setTempUserEmail] = useState(null);
  const [tempPhone, setTempPhone] = useState(null);

  const isAuthenticated = userPhone !== null;

  return (
    <BrowserRouter>
      <Routes>

        {/* 1. Register Page: setTempUserEmail እና setTempPhoneን እንልካለን */}
        <Route
          path="/"
          element={
            <Register
              setUserPhone={setUserPhone}
              setTempUserEmail={setTempUserEmail} // 🔑 አዲስ
              setTempPhone={setTempPhone} // 🔑 አዲስ
            />
          }
        />

        {/* 2. Verify OTP Page: አሁን የተገለጹትን State Variables እንልካለን */}
        <Route
          path="/verify-otp"
          element={
            <VerifyOtp
              setUserPhone={setUserPhone}
              userEmail={tempUserEmail} // ✅ አሁን ተገልጿል
              phone={tempPhone}> // ✅ አሁን ተገልጿል
            </VerifyOtp>
          }
        />

        <Route
                  path="/admin/dashboard"
                  element={
                    isAdminAuthenticated
                      ? <AdminDashboard />
                      : <Navigate to="/admin" replace />
                  }
                />

               <Route
                  path="/home"
                  element={
                    isAuthenticated
                      ? <Home phone={userPhone} /> // ✅ Home አሁን phone={"+251..."} ይቀበላል
                      : <Navigate to="/" replace />
                  }
                />

        <Route
                  path="/admin"
                  element={<AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated} />}
                />

      </Routes>
    </BrowserRouter>
  );
}

export default App;