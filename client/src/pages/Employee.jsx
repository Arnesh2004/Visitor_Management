import { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../api";
import VisitorsManager from "./VisitorsManager.jsx";

const COLORS = ["#8f9bff", "#e08a9c"];

export default function Employee() {
  const [s, setS] = useState(null);
  const load = () => api.get("/visitors/stats").then((r) => setS(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const checkedIn = s?.status.find((x) => x.name === "Checked In")?.value ?? 0;

  return (
    <main className="wrap">
      <h1>Employee dashboard</h1>
      {s && (
        <>
          <div className="cards">
            <div className="card"><b>{s.total}</b><span>Total visitors</span></div>
            <div className="card"><b>{checkedIn}</b><span>Currently checked in</span></div>
            <div className="card"><b>{s.total - checkedIn}</b><span>Checked out</span></div>
          </div>
          <div className="charts">
            <div className="panel"><h2>Check-in status</h2>
              <ResponsiveContainer width="100%" height={240}><PieChart>
                <Pie data={s.status} dataKey="value" nameKey="name" outerRadius={80} label>{s.status.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie>
                <Legend /><Tooltip contentStyle={{ background: "#1c1238", border: "1px solid #ffffff33", color: "#fff" }} /></PieChart></ResponsiveContainer></div>
            <div className="panel"><h2>Visitors per day (last 7 days)</h2>
              <ResponsiveContainer width="100%" height={240}><BarChart data={s.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff26" /><XAxis dataKey="date" stroke="#ffffffaa" /><YAxis allowDecimals={false} stroke="#ffffffaa" /><Tooltip contentStyle={{ background: "#1c1238", border: "1px solid #ffffff33", color: "#fff" }} />
                <Bar dataKey="count" fill="#8f9bff" /></BarChart></ResponsiveContainer></div>
            <div className="panel"><h2>Most visited people</h2>
              <ResponsiveContainer width="100%" height={240}><BarChart data={s.byPerson}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff26" /><XAxis dataKey="name" stroke="#ffffffaa" /><YAxis allowDecimals={false} stroke="#ffffffaa" /><Tooltip contentStyle={{ background: "#1c1238", border: "1px solid #ffffff33", color: "#fff" }} />
                <Bar dataKey="count" fill="#e08a9c" /></BarChart></ResponsiveContainer></div>
          </div>
        </>
      )}
      <VisitorsManager onChange={load} />
    </main>
  );
}
