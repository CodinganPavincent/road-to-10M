// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Mundur satu folder (..)
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import RiwayatList from "./RiwayatList"; // Panggil komponen Riwayat

export default function Dashboard({ user }) {
  const [userData, setUserData] = useState(null);
  const [inputDuit, setInputDuit] = useState(""); 
  const [riwayat, setRiwayat] = useState([]); 
  const [loadingData, setLoadingData] = useState(true);

  // --- 1. AMBIL DATA USER (Balance) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // User baru
          const defaultData = { balance: 0, target: 10000000000 };
          await setDoc(docRef, defaultData);
          setUserData(defaultData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoadingData(false);
    };
    fetchData();
  }, [user]);

  // --- 2. CCTV RIWAYAT ---
  useEffect(() => {
    const riwayatRef = collection(db, "users", user.uid, "riwayat");
    const q = query(riwayatRef, orderBy("waktu", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataBaru = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRiwayat(dataBaru);
    });
    return () => unsubscribe();
  }, [user]);

  // --- FUNGSI-FUNGSI ---
  const handleLogout = async () => {
    await signOut(auth);
    // Gak perlu alert, karena di App.jsx nanti otomatis ganti halaman
  };

  const handleNabung = async () => {
    if (!inputDuit || inputDuit <= 0) return;
    try {
      const saldoBaru = userData.balance + parseInt(inputDuit);
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { balance: saldoBaru });
      await addDoc(collection(db, "users", user.uid, "riwayat"), {
        tipe: "MASUK",
        jumlah: parseInt(inputDuit),
        waktu: new Date().toISOString(),
        keterangan: "Nabung"
      });
      setUserData({ ...userData, balance: saldoBaru });
      setInputDuit("");
    } catch (error) { console.error(error); }
  };

  const handleTarik = async () => {
    if (!inputDuit || inputDuit <= 0) return;
    if (parseInt(inputDuit) > userData.balance) { alert("Saldo kurang!"); return; }
    const nominal = parseInt(inputDuit);
    if (nominal > userData.balance) {
        alert("saldo lu gak cukup!")
        return;
    }

    if (nominal >= 500000) {
        const yakinGak = window.confirm(
            `waduh lu mau narik Rp. ${nominal.toLocaleString('id-ID')}? \n\nIni nominal gede lho. Yakin keperluan mendesak? Inget target 10 Miliar!`
        );
        if (!yakinGak) return;
    } 

    try {
      const saldoBaru = userData.balance - parseInt(inputDuit);
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { balance: saldoBaru });
      await addDoc(collection(db, "users", user.uid, "riwayat"), {
        tipe: "KELUAR",
        jumlah: parseInt(inputDuit),
        waktu: new Date().toISOString(),
        keterangan: "Jajan"
      });
      setUserData({ ...userData, balance: saldoBaru });
      setInputDuit("");
    } catch (error) { console.error(error); }
  };

  const formatRupiah = (angka) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
  const hitungPersen = () => userData ? ((userData.balance / userData.target) * 100).toFixed(6) : 0;

  if (loadingData || !userData) return <div className="text-white text-center mt-20">Loading Dompet...</div>;
  // ... logic atas sama ...

return (
    <div className="min-h-screen bg-white text-white p-6 flex flex-col items-center">
      
        {/* 1. CONTAINER DIPERLEBAR (max-w-5xl) */}
        <div className="w-full max-w-7.2xl">
            
            {/* Header Profil */}
            <div className="flex items-center justify-between mb-8 px-2">
            {/* ... (Isi header sama kayak sebelumnya) ... */}
            {/* Copy aja isi header lu yang tadi */}
            <div className="flex items-center gap-3">
                <img src={user.photoURL} alt="Profil" className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg"/>
                <div>
                    <h1 className="text-xl text-black font-bold">Halo, {user.displayName}!</h1>
                    <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full inline-block">Calon Triliuner</div>
                </div>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-white hover:bg-red-600 bg-red-900/20 px-4 py-2 rounded-full transition-all">Logout</button>
            </div>

            {/* 2. GRID SYSTEM BARU (Lebih Cerdas) */}
            {/* Mobile: 1 Kolom | Tablet: 2 Kolom | Laptop: 4 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KOTAK 1: SALDO (Makan 2 kolom di Laptop) */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition"></div>
                <p className="text-blue-100 text-sm font-medium mb-2">Total Tabungan</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tight">{formatRupiah(userData.balance)}</h2>
                <p className="text-xs text-blue-200 mt-2 opacity-80">Target: {formatRupiah(userData.target)}</p>
            </div>

            {/* KOTAK 2: PROGRESS (Makan 1 kolom) */}
            <div className="bg-white p-6 rounded-3xl border shadow-xl flex flex-col justify-center gap-2 hover:scale-[1.01] transition-transform">
                <span className="text-sm text-gray-400 font-medium">Progress 10M</span>
                <span className="text-3xl font-bold text-blue-400">{hitungPersen()}%</span>
                {/* Logic Warna: Kalau persen > 100 ? Pake Emas : Pake Biru */}
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${hitungPersen() >= 100 ? 'bg-green-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} 
                    style={{ width: `${Math.min(hitungPersen(), 100)}%` }} // Pake Math.min biar barnya gak "jebol" keluar kotak
                ></div>
            </div>

            {/* KOTAK 3: CONTROLS (Makan 1 kolom) */}
            <div className="bg-white p-6 rounded-3xl border shadow-xl flex flex-col justify-center gap-2 hover:scale-[1.01] transition-transform">
                <div className="relative">
                <span className="absolute left-0 top-3 text-slate-500 text-sm">Rp</span>
                <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full bg-transparent text-2xl font-bold text-black placeholder-slate-600 focus:outline-none pl-8 border-b border-slate-700 pb-2 focus:border-blue-500 transition" 
                    value={inputDuit} 
                    onChange={(e) => setInputDuit(e.target.value)}
                />
                </div>
                <div className="flex gap-3 mt-4">
                <button onClick={handleNabung} className="flex-1 bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-95 text-xl">+</button>
                <button onClick={handleTarik} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-95 text-xl">-</button>
                </div>
            </div>

            {/* KOTAK 4: RIWAYAT (Makan Full 4 kolom di Laptop biar puas liatnya) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xl">
                <div className="h-72 overflow-y-auto custom-scrollbar pr-2">
                    <RiwayatList dataRiwayat={riwayat} />
                </div>
            </div>

            </div>
        </div>
    </div>
    );
}