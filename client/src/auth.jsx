import { createContext, useContext, useState } from "react";
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null"));
  const login = ({ token, user }, remember = true) => {
    const store = remember ? localStorage : sessionStorage;
    store.setItem("token", token);
    store.setItem("user", JSON.stringify(user));
    setUser(user);
  };
  const logout = () => { localStorage.clear(); sessionStorage.clear(); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
