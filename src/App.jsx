/* Project: Road to 10M
   Author: Zain
   Dedication: Diansa.
   "You are a special woman in my life, one and only."
   Even if this code runs a thousand times, you're still the exception.
*/
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Import komponen yang udah kita pisah
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return <div className="text-center mt-20 text-white animate-pulse">Loading System...</div>;
  }

  // LOGIC SIMPLE:
  // Kalau ada User -> Tampilin Dashboard (Kirim data user sebagai 'ticket')
  // Kalau gak ada -> Tampilin Login
  return (
    <>
      {user ? <Dashboard user={user} /> : <Login />}
    </>
  );
}

export default App;