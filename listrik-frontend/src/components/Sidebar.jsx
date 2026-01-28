import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    "block rounded-xl px-4 py-3 text-sm font-medium transition " +
    (isActive
      ? "bg-blue-600 text-white shadow"
      : "text-gray-700 hover:bg-blue-50");

  function logout() {
    localStorage.removeItem("admin_login");
    navigate("/login");
  }

  return (
    <aside className="w-64 bg-white border-r p-4">
      {/* HEADER */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 p-4 text-white">
        <div className="text-xs opacity-90">Admin Panel</div>
        <div className="text-lg font-semibold">⚡ Listrik Pascabayar</div>
      </div>

      {/* MENU */}
      <nav className="space-y-2">
        <NavLink to="/" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/users" className={linkClass}>Data User</NavLink>
        <NavLink to="/bills" className={linkClass}>Tagihan</NavLink>
        <NavLink to="/add-user" className={linkClass}>Tambah User</NavLink>

        <button
          onClick={logout}
          className="mt-6 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
