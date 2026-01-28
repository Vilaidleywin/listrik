import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("auth_token");
  const isAdmin = localStorage.getItem("admin_login") === "true";
  const exp = Number(localStorage.getItem("auth_expires_at") || 0);

  // belum login
  if (!token || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // token expired
  if (!exp || Date.now() > exp) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_login");
    localStorage.removeItem("auth_expires_at");
    return <Navigate to="/login" replace />;
  }

  return children;
}
