/* Project: Road to 10M
   Author: Zain
   Dedication: Diansa.
*/
import Dashboard from "./components/Dashboard";

function App() {
  // Kita bikin user palsu biar Dashboard gak error
  const dummyUser = {
    uid: "guest",
    displayName: "Diansa", // Biar dia kaget namanya ada disitu
    photoURL: "https://ui-avatars.com/api/?name=Diansa&background=random&color=fff"
  };

  // LANGSUNG TEMBAK DASHBOARD. GAK USAH PAKE LOGIN-LOGINAN.
  return (
    <>
      <Dashboard user={dummyUser} />
    </>
  );
}

export default App;