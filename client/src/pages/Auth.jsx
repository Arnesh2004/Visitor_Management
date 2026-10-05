import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth.jsx";

const PATHS = {
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 7L4 6v2l8 5 8-5V6l-8 5z",
  lock: "M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9h-2zm-8 0V7a3 3 0 0 1 6 0v2H9z",
  user: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5z",
  role: "M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z",
};
const Icon = ({ n, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={PATHS[n]} /></svg>
);

export default function Auth({ mode }) {
  const reg = mode === "register";
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", role: "" });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNote("");
    try {
      const { data } = await api.post("/auth/" + mode, f);
      login(data, remember);
      nav("/" + data.user.role);
    } catch (x) {
      setError(x.response?.data?.message || "Cannot reach the server");
    }
  };

  return (
    <main className="authpage">
      <form className="authcard" onSubmit={submit}>
        <div className="avatar"><Icon n="user" size={52} /></div>

        {reg && (
          <label className="field"><Icon n="user" />
            <input name="name" placeholder="Full Name" value={f.name} onChange={change} required />
          </label>
        )}
        <label className="field"><Icon n="mail" />
          <input type="email" name="email" placeholder="Email ID" value={f.email} onChange={change} required />
        </label>
        <label className="field"><Icon n="lock" />
          <input type="password" name="password" placeholder="Password" value={f.password} onChange={change} minLength={6} required />
        </label>
        {reg && (
          <label className="field"><Icon n="role" />
            <select name="role" value={f.role} onChange={change} required>
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="visitor">Visitor</option>
            </select>
          </label>
        )}

        {!reg && (
          <div className="authrow">
            <label className="check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
            </label>
            <button type="button" className="link" onClick={() => setNote("Please ask an admin to help with your password.")}>Forgot Password?</button>
          </div>
        )}

        {error && <p className="error" role="alert">{error}</p>}
        {note && <p className="notice">{note}</p>}
        <button type="submit" className="btn-main">{reg ? "Register" : "Login"}</button>

        <p className="switch">
          {reg ? "Already have an account? " : "New here? "}
          <Link to={reg ? "/login" : "/register"}>{reg ? "Login" : "Register"}</Link>
        </p>
      </form>
    </main>
  );
}
