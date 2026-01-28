import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function login(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Isi email dan password dulu!");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login(form.email, form.password);
      const EXPIRE_TIME = 60 * 60 * 1000; // 1 jam

      localStorage.setItem("auth_token", res.data.token);
      localStorage.setItem("admin_login", "true");
      localStorage.setItem("auth_expires_at", String(Date.now() + EXPIRE_TIME));

      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Login gagal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Login Admin</h1>
          <p className="mt-1 text-sm text-gray-600">
            Sistem Listrik Pascabayar
          </p>
        </div>

        <form onSubmit={login} className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              type="email"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="admin@gmail.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              type="password"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full rounded-2xl py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-blue-200 ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Listrik Pascabayar
        </div>
      </div>
    </div>
  );
}
