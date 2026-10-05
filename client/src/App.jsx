import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import Auth from "./pages/Auth.jsx";
import Admin from "./pages/Admin.jsx";
import Employee from "./pages/Employee.jsx";
import VisitorPortal from "./pages/VisitorPortal.jsx";

function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={"/" + user.role} replace />;
  return children;
}

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <strong>Visitor Desk</strong>
      {user && (
        <span>
          {user.name} <em className="role">{user.role}</em>
          <button className="ghost" onClick={logout}>Logout</button>
        </span>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
          <Route path="/employee" element={<Guard role="employee"><Employee /></Guard>} />
          <Route path="/visitor" element={<Guard role="visitor"><VisitorPortal /></Guard>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
