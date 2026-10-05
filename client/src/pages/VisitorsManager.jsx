import { useEffect, useState } from "react";
import api from "../api";

const toLocal = (d) => {
  const t = new Date(d || Date.now());
  t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  return t.toISOString().slice(0, 16);
};
const blank = () => ({ name: "", mobile: "", email: "", organization: "", personToMeet: "", purpose: "", visitDateTime: toLocal(), status: "Checked In" });

export default function VisitorsManager({ onChange = () => {} }) {
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = async (q = "") => {
    try { setVisitors((await api.get("/visitors", { params: { search: q } })).data); }
    catch { setError("Cannot load visitors. Is the backend running?"); }
  };
  useEffect(() => { api.get("/users/employees").then((r) => setEmployees(r.data)).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 300); return () => clearTimeout(t); }, [search]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(blank()); setEditId(null); };
  const refresh = () => { load(search); onChange(); };

  const submit = async (e) => {
    e.preventDefault(); setError("");
    try {
      editId ? await api.put(`/visitors/${editId}`, form) : await api.post("/visitors", form);
      reset(); refresh();
    } catch (x) { setError(x.response?.data?.message || "Could not save"); }
  };
  const edit = (v) => { setEditId(v._id); setForm({ ...v, visitDateTime: toLocal(v.visitDateTime) }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (id) => { if (window.confirm("Delete this visitor record?")) { await api.delete(`/visitors/${id}`); refresh(); } };
  const toggle = async (v) => { await api.put(`/visitors/${v._id}`, { status: v.status === "Checked In" ? "Checked Out" : "Checked In" }); refresh(); };

  return (
    <>
      <form className="panel" onSubmit={submit}>
        <h2>{editId ? "Edit visitor" : "Add visitor"}</h2>
        <div className="grid">
          <label>Name<input name="name" value={form.name} onChange={change} required /></label>
          <label>Mobile number<input name="mobile" value={form.mobile} onChange={change} maxLength={10} required /></label>
          <label>Email<input type="email" name="email" value={form.email} onChange={change} /></label>
          <label>Organization / college<input name="organization" value={form.organization} onChange={change} /></label>
          <label>Person to meet
            <input name="personToMeet" list="emps" value={form.personToMeet} onChange={change} required />
            <datalist id="emps">{employees.map((e) => <option key={e._id} value={e.name} />)}</datalist>
          </label>
          <label>Purpose of visit<input name="purpose" value={form.purpose} onChange={change} required /></label>
          <label>Date and time<input type="datetime-local" name="visitDateTime" value={form.visitDateTime} onChange={change} /></label>
          <label>Status
            <select name="status" value={form.status} onChange={change}><option>Checked In</option><option>Checked Out</option></select>
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="submit">{editId ? "Save changes" : "Add visitor"}</button>
          {editId && <button type="button" className="ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <section className="panel">
        <div className="bar">
          <h2>Visitors ({visitors.length})</h2>
          <input className="search" placeholder="Search by name or mobile number" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search visitors" />
        </div>
        {visitors.length === 0 ? <p className="empty">No visitors found.</p> : (
          <div className="scroll"><table>
            <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Organization</th><th>Meeting</th><th>Purpose</th><th>Visit time</th><th>Status</th><th></th></tr></thead>
            <tbody>{visitors.map((v) => (
              <tr key={v._id}>
                <td>{v.name}</td><td>{v.mobile}</td><td>{v.email || "–"}</td><td>{v.organization || "–"}</td>
                <td>{v.personToMeet}</td><td>{v.purpose}</td><td>{new Date(v.visitDateTime).toLocaleString()}</td>
                <td><button className={"pill " + (v.status === "Checked In" ? "in" : "out")} onClick={() => toggle(v)}>{v.status}</button></td>
                <td className="row-actions"><button className="ghost" onClick={() => edit(v)}>Edit</button><button className="danger" onClick={() => remove(v._id)}>Delete</button></td>
              </tr>))}
            </tbody></table></div>
        )}
      </section>
    </>
  );
}
