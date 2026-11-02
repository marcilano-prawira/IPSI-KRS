import { useEffect, useState } from "react";
import "./App.css";
import { api, authService } from "./services";
import Login from "./components/Login.jsx";
import KrsPage from "./components/KrsPage.jsx";

export default function App() {
  const [user, setUser] = useState(() => authService.currentUser());

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Token kedaluwarsa -> kembali ke halaman login
  useEffect(() => {
    api.onUnauthorized = logout;
  }, []);

  return user ? <KrsPage onLogout={logout} /> : <Login onLogin={setUser} />;
}
