
import { useState, useEffect } from "react";
import axios from "axios";
import { Phone, PhoneOff, Delete } from "lucide-react";

// Home Component. 'phone' ን እንደ prop ይቀበላል (የተጠቃሚውን ስልክ ቁጥር)
function Home({ phone }) {
  // ************ STATEs ************
  const [number, setNumber] = useState(""); // Keypad ላይ የተጫነው ቁጥር
  const [isCalling, setIsCalling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [callStatus, setCallStatus] = useState(null);
  const CALL_COST_SECONDS = 60;

  // ************************************************************
  // 1. Data Fetching & SSE Logic (እንዳለ ይቀጥላል)
  // ************************************************************
  const fetchMinutes = async () => {
    if (!phone) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/user?phone=${encodeURIComponent(phone)}`);
      const data = response.data;
      if (data.success && data.user && data.user.minutes !== undefined) {
        const minutes = Number(data.user.minutes);
        setSecondsLeft(minutes * 60);
      } else {
        setSecondsLeft(0);
      }
      
    } catch (error) {
      setSecondsLeft(0);
    }
  };

  useEffect(() => {
    if (!phone) return;
    fetchMinutes();
    const eventSource = new EventSource(`http://localhost:5000/api/admin/updates?phone=${encodeURIComponent(phone)}`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'minutes_updated') {
          const minutes = Number(data.totalMinutes);
          setSecondsLeft(minutes * 60);
        }
      } catch (e) { /* Ignore */ }
    };
    eventSource.onerror = (error) => { console.error("❌ SSE Connection Error:", error); };
    return () => eventSource.close();
  }, [phone]);

  // 2. የጊዜ ቆጣሪ አመክንዮ (እንዳለ ይቀጥላል)
  useEffect(() => {
    let timer;
    if (isCalling && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prevSeconds => {
          if (prevSeconds > 0) return prevSeconds - 1;
          clearInterval(timer);
          setIsCalling(false);
          return 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCalling, secondsLeft]);

  // 3. የጊዜ ማሳያ ተግባር (እንዳለ ይቀጥላል)
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 4. የጥሪ መጀመር ተግባር (እንዳለ ይቀጥላል)
  // 4. የጥሪ መጀመር ተግባር (የተስተካከለ)
  const handleCall = async () => {
    if (secondsLeft < CALL_COST_SECONDS) {
      alert("ጥሪ ለመጀመር ቢያንስ 1 ደቂቃ (60 ሰከንድ) የሎትም!");
      return;
    }
    // ⚠️ ዓለም አቀፍ ቁጥር ፎርማት ቼክ
    if (!number.startsWith('+') || number.length < 10) {
      alert("እባክዎ ትክክለኛ ዓለም አቀፍ የስልክ ቁጥር በሀገር ኮድ (+XXX...) ያስገቡ!");
      return;
    }

    // 🔑 ወሳኝ ማስተካከያ: Backend የሚፈልገውን 'clientPhoneNumber' መጨመር
    if (!phone || !phone.startsWith('+')) {
      alert("የእርስዎ የስልክ ቁጥር በትክክል አልተጫነም ወይም ትክክለኛ ፎርማት አይደለም!");
      return;
    }

    const callMinutes = CALL_COST_SECONDS / 60;
    setCallStatus('connecting');

    try {
      const response = await axios.post("http://localhost:5000/api/call-user", {
        userPhone: number, // የመጨረሻው ተደዋይ ቁጥር
        clientPhoneNumber: phone, // 👈 ጥሪውን የጀመረው (እርስዎ)
        callDuration: callMinutes
      });

      if (response.data.success) {
        setSecondsLeft(response.data.minutesRemaining * 60);
        setIsCalling(true);
        setCallStatus('ringing');
      } else {
        setCallStatus('failed');
        alert(response.data.message);
        setSecondsLeft(response.data.minutesRemaining * 60);
      }
    } catch (error) {
      setCallStatus('failed');
      const msg = error.response ? error.response.data.message : "የሰርቨር ግንኙነት ስህተት!";
      alert(msg);
    } finally {
      // Twilio Ringing Tone የሚቆየውን ያህል ጊዜ ከቆየ በኋላ Status ን እናጠፋለን
      setTimeout(() => {
        // ጥሪው ከተሳካ 'ringing' ሆኖ ይቆያል፣ ካልተሳካ ደግሞ ከጥቂት ሰከንዶች በኋላ ይጠፋል
        if (callStatus !== 'ringing') {
          setCallStatus(null);
        }
      }, callStatus === 'ringing' ? 10000 : 5000); // 10s or 5s
    }
  };
  // const handleCall = async () => {
  //   if (secondsLeft < CALL_COST_SECONDS) {
  //     alert("ጥሪ ለመጀመር ቢያንስ 1 ደቂቃ (60 ሰከንድ) የሎትም!");
  //     return;
  //   }
  //   // ⚠️ ዓለም አቀፍ ቁጥር ፎርማት ቼክ: '+' ባይኖርም Twilio ይደውላል ነገር ግን ማስገደድ ለ Twilio ይረዳል
  //   if (!number.startsWith('+') || number.length < 10) {
  //     alert("እባክዎ ትክክለኛ ዓለም አቀፍ የስልክ ቁጥር በሀገር ኮድ (+XXX...) ያስገቡ!");
  //     return;
  //   }

  //   const callMinutes = CALL_COST_SECONDS / 60;
  //   setCallStatus('connecting');
  //   // ... (የተቀረው የጥሪ ሎጂክ እንዳለ ይቀጥላል)
  //   try {
  //     const response = await axios.post("http://localhost:5000/api/call-user", {
  //       userPhone: number,
  //       callDuration: callMinutes
  //     });
  //     if (response.data.success) {
  //       setSecondsLeft(response.data.minutesRemaining * 60);
  //       setIsCalling(true);
  //       setCallStatus('ringing');
  //     } else {
  //       setCallStatus('failed');
  //       alert(response.data.message);
  //       setSecondsLeft(response.data.minutesRemaining * 60);
  //     }
  //   } catch (error) {
  //     setCallStatus('failed');
  //     const msg = error.response ? error.response.data.message : "የሰርቨር ግንኙነት ስህተት!";
  //     alert(msg);
  //   } finally {
  //     // Twilio Ringing Tone የሚቆየውን ያህል ጊዜ ከቆየ በኋላ Status ን እናጠፋለን
  //     if (callStatus === 'ringing') {
  //       setTimeout(() => setCallStatus(null), 10000);
  //     } else {
  //       setTimeout(() => setCallStatus(null), 5000);
  //     }
  //   }
  // };

  // 5. የጥሪ ማቆም ተግባር (እንዳለ ይቀጥላል)
  const handleEndCall = () => {
    setIsCalling(false);
    setCallStatus(null);
  };

  // ************************************************************
  // 🔑 6. ወሳኝ ለውጥ: ቁልፎች ሲጫኑ የሚሰራው (Handle Dial Pad Click)
  // ************************************************************
  const handleDialPadClick = (key) => {
    setNumber(prev => {
      // ቁልፉ delete/clear ካልሆነ እና ርዝመቱ ከ 25 ካነሰ
      if (prev.length < 25) {
        // ቁልፉ 0 ከሆነ ወይም ቁጥር ከሆነ (1-9)
        if (key === 0 || (typeof key === 'number' && key >= 1 && key <= 9)) {
          return prev + key;
        }
        // ቁልፉ '+' ከሆነ
        if (key === '+') {
          if (!prev.includes('+')) {
            return prev + key;
          }
          return prev;
        }
        // ቁልፉ '#' ከሆነ
        if (key === '#') {
          return prev + key;
        }
        // ለ 0፣ ቁልፉ '0' (string) ሆኖ ከመጣ
        if (key === '0') {
          return prev + '0';
        }
      }
      return prev;
    });
  };

  // ************************************************************
  // 🔑 7. ወሳኝ ለውጥ: የቁልፍ ሰሌዳ ዲዛይን (Dial Pad Layout)
  // ************************************************************
  const dialPadKeys = [
    { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
    { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
    { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
    // ⚠️ ማስተካከያ: '+' በ '*' ተተክቶ ነበር፣ አሁን '+' ን ለብቻው እና 0 ን ለብቻው አደረግን
    { key: '+', letters: '' }, // '+'
    { key: 0, letters: '' },   // 👈 '0' (ዜሮ) ቁልፍ
    { key: '#', letters: '' }  // '#'
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-10"
      style={{ background: "linear-gradient(135deg, #001f3f, #003f7f, #0074D9)", color: "white" }}>

      <div className="w-full max-w-sm flex justify-between items-center px-5 mb-8">
        <div className="text-right">
          <p className="text-lg font-semibold">የቀሩ ደቂቃዎች</p>
          <p className="text-5xl font-extrabold text-yellow-300">
            {formatTime(secondsLeft)}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            ስልክ ቁጥርዎ: **{phone}**
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs bg-black bg-opacity-40 p-5 rounded-3xl text-center">

        {/* 1. የቁጥር ማስገቢያ ቦታ */}
        <div className="h-16 flex items-center justify-center border border-gray-400 rounded-xl mb-5 text-3xl overflow-hidden px-2">
          {number || "• • • • • • • • •"}
        </div>

        {/* 2. የጥሪ ሁኔታ ማሳያ */}
        {callStatus === 'connecting' && <p className="text-lg text-blue-300">📞 ከ Backend ጋር እየተገናኘ ነው...</p>}
        {callStatus === 'ringing' && <p className="text-lg text-orange-300">🔔 እየደወለ ነው...</p>}
        {callStatus === 'failed' && <p className="text-lg text-red-400">❌ ጥሪው አልተሳካም!</p>}

        {/* 3. የቁልፍ ሰሌዳ (Keypad) */}
        <div className="grid grid-cols-3 gap-4 text-3xl font-bold mb-6 text-black">
          {dialPadKeys.map(({ key, letters }) => (
            <button
              key={key}
              className="bg-white bg-opacity-20 p-4 rounded-full hover:bg-opacity-40 flex flex-col items-center justify-center relative h-20"
              // ⚠️ ማስተካከያ: 0 ሲጫን '+' እንዲያስገባ የሚያደርገውን ኮድ አስወግደናል!
              onClick={() => handleDialPadClick(key)}
            >
              <span className="text-3xl">{key}</span>
              {letters && <span className="text-xs absolute bottom-1 tracking-widest">{letters}</span>}
            </button>
          ))}
        </div>

        {/* 4. የመጨረሻ ቁጥር መደምሰስ / መደወል */}
        <div className="flex justify-center gap-5">

          <button
            className="p-5 bg-gray-700 rounded-full hover:bg-gray-600"
            onClick={() => setNumber(prev => prev.slice(0, -1))}
            disabled={isCalling}
          >
            <Delete size={28} />
          </button>

          {!isCalling ? (
            <button
              className="p-6 bg-green-500 rounded-full hover:bg-green-600 disabled:opacity-50"
              onClick={handleCall}
              disabled={secondsLeft < CALL_COST_SECONDS || isCalling || number.length < 10}
            >
              <Phone size={32} />
            </button>
          ) : (
            <button
              className="p-6 bg-red-500 rounded-full hover:bg-red-600"
              onClick={handleEndCall}
            >
              <PhoneOff size={32} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-yellow-300">🔔 አንድ ጥሪ ${CALL_COST_SECONDS / 60} ደቂቃ ይጠይቃል!</p>
      </div>
    </div>
  );
}

export default Home;