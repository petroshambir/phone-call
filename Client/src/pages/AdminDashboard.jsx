
import { useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [phone, setPhone] = useState("");
  const [minutes, setMinutes] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ ደቂቃዎችን ወደ Backend የሚጨምር ተግባር
  const addMinutes = async () => {
    if (!phone || !minutes) {
      setMsg("ሁለቱንም ሳጥኖች ይሙሉ");
      return;
    }

    try {
      // 🔑 ቁልፍ ማስተካከያ: ደቂቃውን ወደ ቁጥር (Number) መቀየር
      const minutesValue = parseFloat(minutes);

      if (isNaN(minutesValue) || minutesValue <= 0) {
        setMsg("❌ ትክክለኛ የደቂቃ ቁጥር ያስገቡ");
        return;
      }

      // ✅ ትክክለኛውን ኤንድፖይንት ይጠቀማል 
      const res = await axios.post("https://phone-call-backend.onrender.com/api/admin/add-minutes", {
        phone: phone.trim(),
        minutes: minutesValue // የተለወጠው ቁጥር
      });

      setMsg(`✅ ${minutesValue} ደቂቃ ለ ${phone} ተጨምሯል!`);

      // Reset
      setTimeout(() => {
        setPhone("");
        setMinutes("");
        setMsg("");
      }, 3000);

    } catch (err) {
      console.error("ስህተት:", err);
      // 🔑 የተሻሻለ የስህተት አያያዝ (Backend መልእክቱን ለመያዝ)
      const errorMessage = err.response?.data?.message || err.message || "አገናኝ ችግር";
      setMsg("❌ አልተሳካም: " + errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">📞 ደቂቃ አስገባ (Admin)</h1>

        {msg && (
          <div className={`p-3 rounded mb-4 text-center ${msg.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
            {msg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">ስልክ ቁጥር</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251911223344"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">የሚጨመረው ደቂቃ</label>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="ምሳሌ: 30"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>

          <button
            onClick={addMinutes}
            className="w-full bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-700 transition duration-150"
          >
            ➕ ደቂቃ ጨምር
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="font-semibold text-blue-800">📌 ማስታወሻ</p>
          <p className="text-sm text-blue-600 mt-1">
            1. ደቂቃ ከተጨመረ በኋላ በሆም ገጽ ላይ ወዲያውኑ ይታያል (በ5 ሰከንድ Auto-refresh ምክንያት)።<br />
            2. *የተስተካከለው የ Backend ኮድ* ደቂቃውን በትክክል ወደ ዳታቤዝ ያስቀምጣል።
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;