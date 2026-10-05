import { useEffect, useState } from "react";
import api from "../api";
import VisitorsManager from "./VisitorsManager.jsx";

function Employees() {
  const [list, setList] = useState([]);
  const load = () => api.get("/users/employees").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const remove = async (id) => { if (window.confirm("Remove this employee account?")) { await api.delete(`/users/${id}`); load(); } };
  return (
    <section className="panel">
      <h2>Employees ({list.length})</h2>
      {list.length === 0 ? <p className="empty">No employees have registered yet.</p> : (
        <div className="scroll"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th></th></tr></thead>
          <tbody>{list.map((e) => (
            <tr key={e._id}><td>{e.name}</td><td>{e.email}</td><td>{new Date(e.createdAt).toLocaleDateString()}</td>
              <td><button className="danger" onClick={() => remove(e._id)}>Remove</button></td></tr>))}
          </tbody></table></div>
      )}
    </section>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("visitors");
  return (
    <main className="wrap">
      <h1>Admin dashboard</h1>
      <div className="tabs">
        <button className={tab === "visitors" ? "" : "ghost"} onClick={() => setTab("visitors")}>Visitors</button>
        <button className={tab === "employees" ? "" : "ghost"} onClick={() => setTab("employees")}>Employees</button>
      </div>
      {tab === "visitors" ? <VisitorsManager /> : <Employees />}
    </main>
  );
}
