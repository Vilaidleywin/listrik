import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { customersApi } from "../api/customers";
import { billsApi } from "../api/bills";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    try {
      setLoading(true);

      // jalanin paralel biar cepet
      const [uRes, bRes] = await Promise.all([
        customersApi.list(),
        billsApi.list(),
      ]);

      setUsers(uRes.data || []);
      setBills(bRes.data || []);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          JSON.stringify(err?.response?.data?.errors) ||
          "Gagal load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const totalPendapatan = useMemo(
    () => bills.reduce((sum, b) => sum + Number(b.total || 0), 0),
    [bills]
  );

  const totalLunas = useMemo(
    () =>
      bills
        .filter((b) => !!b.paid)
        .reduce((sum, b) => sum + Number(b.total || 0), 0),
    [bills]
  );

  return (
    <div className="min-h-screen bg-blue-50 flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
            <p className="mt-1 text-sm text-blue-700/80">
              Ringkasan sistem listrik pascabayar.
            </p>
          </div>

          <button
            onClick={fetchAll}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* CARDS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Total User" value={loading ? "..." : users.length} icon="👤" />
          <Card title="Total Tagihan" value={loading ? "..." : bills.length} icon="🧾" />
          <Card
            title="Total Pendapatan"
            value={loading ? "..." : `Rp ${totalPendapatan.toLocaleString("id-ID")}`}
            icon="⚡"
          />
        </div>

        {/* INFO */}
        <div className="mt-8 rounded-2xl bg-white border border-blue-100 p-6">
          <h2 className="font-semibold text-blue-900">Informasi</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            <li>Data user dan tagihan diambil dari database (API Laravel)</li>
            <li>Total lunas: <b>Rp {totalLunas.toLocaleString("id-ID")}</b></li>
            <li>Struk bisa langsung dicetak dari menu Tagihan</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl bg-white border border-blue-100 p-5 shadow-sm">
      <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
      </div>
      <div className="mt-2 text-3xl font-bold text-blue-800">{value}</div>
    </div>
  );
}
