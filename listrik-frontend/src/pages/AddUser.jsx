import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { customersApi } from "../api/customers";

export default function AddUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    nomor_kwh: "",
    alamat: "",
    voltase: "900",
    no_hp: "",
  });

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.nama || !form.nomor_kwh || !form.alamat || !form.no_hp) {
      alert("Lengkapi data dulu!");
      return;
    }

    try {
      setLoading(true);
      await customersApi.create(form);
      navigate("/users");
    } catch (err) {
      // kalau nomor_kwh duplikat, laravel biasanya balikin 422
      const msg =
        err?.response?.data?.message ||
        "Gagal simpan. Cek server Laravel / nomor kWh mungkin sudah ada.";
      alert(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-blue-900">Tambah User</h1>
        <p className="mt-1 text-sm text-blue-700/80">
          Isi data pelanggan listrik pascabayar.
        </p>

        <form
          onSubmit={submit}
          className="mt-6 max-w-2xl rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
        >
          <Field label="Nama" name="nama" value={form.nama} onChange={onChange} />
          <Field
            label="Nomor kWh"
            name="nomor_kwh"
            value={form.nomor_kwh}
            onChange={onChange}
          />
          <Field
            label="Alamat"
            name="alamat"
            value={form.alamat}
            onChange={onChange}
          />

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Voltase/Daya</label>
            <select
              name="voltase"
              value={form.voltase}
              onChange={onChange}
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
            value={form.no_hp}
            onChange={onChange}
          />

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/users")}
              className="rounded-xl border px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <div className="mt-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    </div>
  );
}
