import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../auth.jsx";

const toLocal = (d) => {
  const t = new Date(d || Date.now());
  t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  return t.toISOString().slice(0, 16);
};

export default function VisitorPortal() {
  const { user } = useAuth();
  const blank = () => ({ name: user.name, mobile: "", email: user.email, organization: "", personToMeet: "", purpose: "", visitDateTime: toLocal() });
  const [f, setF] = useState(blank());
  const [employees, setEmployees] = useState([]);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = () => api.get("/visitors/my").then((r) => setVisits(r.data)).catch(() => {});
  useEffect(() => { load(); api.get("/users/employees").then((r) => setEmployees(r.data)); }, []);
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const checkIn = async (e) => {
    e.preventDefault(); setError(""); setOk("");
    try { await api.post("/visitors/self", f); setF(blank()); setOk("You are checked in."); load(); }
    catch (x) { setError(x.response?.data?.message || "Could not check in"); }
  };
  const checkOut = async (id) => { await api.put(`/visitors/self/${id}/checkout`); load(); };

  return (
    <main className="wrap">
      <h1>Visitor check-in</h1>
      <form className="panel" onSubmit={checkIn}>
        <h2>New visit</h2>
        <div className="grid">
          <label>Name<input name="name" value={f.name} onChange={change} required /></label>
          <label>Mobile number<input name="mobile" value={f.mobile} onChange={change} maxLength={10} required /></label>
          <label>Email<input type="email" name="email" value={f.email} onChange={change} /></label>
          <label>Organization / college<input name="organization" value={f.organization} onChange={change} /></label>
          <label>Person to meet
            <select name="personToMeet" value={f.personToMeet} onChange={change} required>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e._id} value={e.name}>{e.name}</option>)}
            </select>
          </label>
          <label>Purpose of visit<input name="purpose" value={f.purpose} onChange={change} required /></label>
          <label>Date and time of visit<input type="datetime-local" name="visitDateTime" value={f.visitDateTime} onChange={change} required /></label>
        </div>
        {employees.length === 0 && <p className="muted">No employees are registered yet, so there is nobody to select.</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {ok && <p className="success">{ok}</p>}
        <div className="actions"><button type="submit">Check in</button></div>
      </form>

      <section className="panel">
        <h2>My visits ({visits.length})</h2>
        {visits.length === 0 ? <p className="empty">No visits yet.</p> : (
          <div className="scroll"><table>
            <thead><tr><th>Date and time</th><th>Meeting</th><th>Purpose</th><th>Status</th><th></th></tr></thead>
            <tbody>{visits.map((v) => (
              <tr key={v._id}><td>{new Date(v.visitDateTime).toLocaleString()}</td><td>{v.personToMeet}</td><td>{v.purpose}</td>
                <td><span className={"pill " + (v.status === "Checked In" ? "in" : "out")}>{v.status}</span></td>
                <td>{v.status === "Checked In" && <button onClick={() => checkOut(v._id)}>Check out</button>}</td></tr>))}
            </tbody></table></div>
        )}
      </section>
    </main>
  );
}
