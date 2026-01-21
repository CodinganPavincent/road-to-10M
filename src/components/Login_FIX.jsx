//src/components/login.jsx

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("database error:", error);
      alert("Login Gagal!");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-5xl font-bold mb-2">ROAD TO 10M 💸</h1>
      <p className="mb-8 text-gray-400">Gerbang Menuju Kebebasan Finansial</p>
      
      <button 
        onClick={handleLogin}
        className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
      >
        {/* Ikon Google Sederhana */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.51 19.27 5 16.38 5 12c0-4.1 3.2-7.27 7.16-7.27c2.14 0 4.1.88 5.4 2.37l1.93-1.93C17.48 2.87 14.53 2 12.16 2 6.61 2 2 6.61 2 12s4.61 10 10.16 10c8.13 0 10.68-7.51 9.19-10.9z"/>
        </svg>
        Login Pake Google
      </button>
    </div>
  );
}