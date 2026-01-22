// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase"; 
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import RiwayatList from "./RiwayatList"; 

export default function Dashboard({ user }) {
  // --- 0. PENGAMAN USER (Biar gak crash pas bypass login) ---
  const currentUser = user || {
    uid: "guest",
    displayName: "Zain", // Biar tampil nama lu
    photoURL: "https://ui-avatars.com/api/?name=Zain&background=random"
  };

  const [userData, setUserData] = useState(null);
  const [inputDuit, setInputDuit] = useState(""); 
  const [riwayat, setRiwayat] = useState([]); 
  const [loadingData, setLoadingData] = useState(true);

  // --- DATA DUMMY (Akan tampil kalau gak ada data Firebase) ---
  const dummyRiwayat = [
    { id: 1, keterangan: "Gaji Project (Dummy)", jumlah: 15000000, tipe: "MASUK", waktu: new Date().toISOString() },
    { id: 2, keterangan: "Investasi Saham (Dummy)", jumlah: 5000000, tipe: "KELUAR", waktu: new Date().toISOString() },
    { id: 3, keterangan: "Ngopi Santai", jumlah: 50000, tipe: "KELUAR", waktu: new Date().toISOString() }
  ];

  // Logic: Kalau riwayat kosong, pake dummy. Kalau ada, pake riwayat asli.
  const dataToDisplay = riwayat.length > 0 ? riwayat : dummyRiwayat;

  // --- 1. AMBIL DATA USER (Balance) ---
  useEffect(() => {
    // Kalau mode tamu (guest), langsung set data palsu biar cepet
    if (currentUser.uid === "guest") {
        setUserData({ balance: 10000000, target: 10000000000 });
        setLoadingData(false);
        return;
    }

    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
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
  }, [currentUser]);

  // --- 2. CCTV RIWAYAT ---
  useEffect(() => {
    if (currentUser.uid === "guest") return; // Skip kalau tamu

    const riwayatRef = collection(db, "users", currentUser.uid, "riwayat");
    const q = query(riwayatRef, orderBy("waktu", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataBaru = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRiwayat(dataBaru);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // --- FUNGSI-FUNGSI ---
  const handleLogout = async () => {
    if (currentUser.uid === "guest") {
        window.location.reload(); // Refresh aja kalau tamu
        return;
    }
    await signOut(auth);
  };

  const handleNabung = async () => {
    if (!inputDuit || inputDuit <= 0) return;
    if (currentUser.uid === "guest") { alert("Mode Tamu: Data tidak disimpan ke database."); return; }

    try {
      const saldoBaru = userData.balance + parseInt(inputDuit);
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, { balance: saldoBaru });
      await addDoc(collection(db, "users", currentUser.uid, "riwayat"), {
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
    if (currentUser.uid === "guest") { alert("Mode Tamu: Data tidak disimpan."); return; }

    if (parseInt(inputDuit) > userData.balance) { alert("Saldo kurang!"); return; }
    const nominal = parseInt(inputDuit);
    
    if (nominal >= 500000) {
        const yakinGak = window.confirm(
            `waduh lu mau narik Rp. ${nominal.toLocaleString('id-ID')}? \n\nIni nominal gede lho. Yakin keperluan mendesak? Inget target 10 Miliar!`
        );
        if (!yakinGak) return;
    } 

    try {
      const saldoBaru = userData.balance - parseInt(inputDuit);
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, { balance: saldoBaru });
      await addDoc(collection(db, "users", currentUser.uid, "riwayat"), {
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

  if (loadingData || !userData) return <div className="text-black text-center mt-20">Loading Dompet...</div>;

  return (
    <div className="min-h-screen bg-white text-white p-6 flex flex-col items-center">
      
        <div className="w-full max-w-7xl">
            
            {/* Header Profil */}
            <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
                <img src={currentUser.photoURL} alt="Profil" className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg"/>
                <div>
                    <h1 className="text-xl text-black font-bold">Halo, {currentUser.displayName}!</h1>
                    <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full inline-block">Calon Triliuner</div>
                </div>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-white hover:bg-red-600 bg-red-900/20 px-4 py-2 rounded-full transition-all">Logout</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KOTAK 1: SALDO */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition"></div>
                <p className="text-blue-100 text-sm font-medium mb-2">Total Tabungan</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tight">{formatRupiah(userData.balance)}</h2>
                <p className="text-xs text-blue-200 mt-2 opacity-80">Target: {formatRupiah(userData.target)}</p>
            </div>

            {/* KOTAK 2: PROGRESS */}
            <div className="bg-white p-6 rounded-3xl border shadow-xl flex flex-col justify-center gap-2 hover:scale-[1.01] transition-transform">
                <span className="text-sm text-gray-400 font-medium">Progress 10M</span>
                <span className="text-3xl font-bold text-blue-400">{hitungPersen()}%</span>
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${hitungPersen() >= 100 ? 'bg-green-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} 
                    style={{ width: `${Math.min(hitungPersen(), 100)}%` }} 
                ></div>
            </div>

            {/* KOTAK 3: CONTROLS */}
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

            {/* KOTAK 4: RIWAYAT (SUDAH DIPERBAIKI PAKE dataToDisplay) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xl">
                <div className="h-72 overflow-y-auto custom-scrollbar pr-2">
                    <RiwayatList dataRiwayat={dataToDisplay} />
                </div>
            </div>

            </div>
        </div>
    </div>
  );
}