import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { customersApi } from "../api/customers";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await customersApi.list();
      setUsers(res.data);
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
      alert(
        err?.response?.data?.message ||
          "Gagal ambil data user. Cek backend / token."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      [u.nama, u.nomor_kwh, u.alamat, u.no_hp, u.voltase].some((x) =>
        String(x ?? "")
          .toLowerCase()
          .includes(s)
      )
    );
  }, [users, q]);

  async function onDelete(id) {
    if (!confirm("Yakin hapus user ini?")) return;
    try {
      await customersApi.remove(id);
      fetchUsers();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert(
        err?.response?.data?.message ||
          "Gagal hapus user. Cek backend / token."
      );
    }
  }

  function openEdit(user) {
    setEditing({ ...user });
  }

  function closeEdit() {
    setEditing(null);
  }

  function onEditChange(e) {
    setEditing((u) => ({ ...u, [e.target.name]: e.target.value }));
  }

  async function saveEdit() {
    if (!editing?.nama || !editing?.alamat || !editing?.no_hp) {
      alert("Lengkapi data dulu!");
      return;
    }

    // 🔑 nomor_kwh WAJIB dikirim (biar ga 422)
    const payload = {
      nama: editing.nama,
      nomor_kwh: editing.nomor_kwh,
      alamat: editing.alamat,
      voltase: editing.voltase,
      no_hp: editing.no_hp,
    };

    try {
      await customersApi.update(editing.id, payload);
      await fetchUsers();
      closeEdit();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : "Gagal simpan data");
      alert(`Gagal simpan. Status: ${status}\n${msg}`);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Data User</h1>
            <p className="mt-1 text-sm text-blue-700/80">
              Kelola pelanggan: tambah, edit, hapus.
            </p>
          </div>

          <Link
            to="/add-user"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Tambah User
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-gray-800">
              {loading ? "Memuat data..." : `Total: ${filtered.length} user`}
            </div>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / nomor kWh / alamat / hp..."
              className="w-full md:w-96 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 pr-4">Nomor kWh</th>
                  <th className="py-3 pr-4">Nama</th>
                  <th className="py-3 pr-4">Alamat</th>
                  <th className="py-3 pr-4">Daya</th>
                  <th className="py-3 pr-4">No HP</th>
                  <th className="py-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-gray-500">
                      Memuat data user...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-gray-500">
                      Belum ada data. Klik <b>Tambah User</b>.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {u.nomor_kwh}
                      </td>
                      <td className="py-3 pr-4">{u.nama}</td>
                      <td className="py-3 pr-4">{u.alamat}</td>
                      <td className="py-3 pr-4">{u.voltase} VA</td>
                      <td className="py-3 pr-4">{u.no_hp}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(u.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL EDIT */}
        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">Edit User</h2>
                  <p className="text-sm text-gray-600">
                    Ubah data pelanggan lalu simpan.
                  </p>
                </div>
                <button
                  onClick={closeEdit}
                  className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <Field
                  label="Nama"
                  name="nama"
                  value={editing.nama}
                  onChange={onEditChange}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nomor kWh
                  </label>
                  <input
                    value={editing.nomor_kwh}
                    readOnly
                    className="mt-2 w-full rounded-xl border bg-gray-100 px-4 py-3 text-sm"
                  />
                </div>

                <Field
                  label="Alamat"
                  name="alamat"
                  value={editing.alamat}
                  onChange={onEditChange}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Voltase/Daya
                  </label>
                  <select
                    name="voltase"
                    value={editing.voltase}
                    onChange={onEditChange}
                    className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="450">450 VA</option>
                    <option value="900">900 VA</option>
                    <option value="1300">1300 VA</option>
                    <option value="2200">2200 VA</option>
                    <option value="3500">3500 VA</option>
                  </select>
                </div>

                <Field
                  label="Nomor HP"
                  name="no_hp"
                  value={editing.no_hp}
                  onChange={onEditChange}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={closeEdit}
                  className="rounded-xl border px-4 py-2"
                >
                  Batal
                </button>
                <button
                  onClick={saveEdit}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    </div>
  );
}
