import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { customersApi } from "../api/customers";
import { billsApi } from "../api/bills";
import { tarifPerKwh } from "../app/tarif";

export default function Bills() {
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBills, setLoadingBills] = useState(true);

  const [filter, setFilter] = useState("all"); // all | unpaid | paid
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ userId: "", pemakaian: "" });

  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    try {
      setLoadingUsers(true);
      const res = await customersApi.list();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          JSON.stringify(err?.response?.data?.errors) ||
          "Gagal memuat pelanggan"
      );
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchBills() {
    try {
      setLoadingBills(true);
      const res = await billsApi.list();
      setBills(res.data || []);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          JSON.stringify(err?.response?.data?.errors) ||
          "Gagal memuat tagihan"
      );
    } finally {
      setLoadingBills(false);
    }
  }

  useEffect(() => {
    // Biar dropdown cepat keisi:
    fetchUsers(); // ini duluan
    fetchBills(); // ini nyusul
  }, []);

  const selectedUser = useMemo(
    () => users.find((u) => String(u.id) === String(form.userId)),
    [users, form.userId]
  );

  const tarif = selectedUser ? tarifPerKwh(selectedUser.voltase) : 0;
  const total =
    selectedUser && form.pemakaian ? Number(form.pemakaian) * tarif : 0;

  async function submit(e) {
    e.preventDefault();

    if (!selectedUser || !form.pemakaian) {
      alert("Lengkapi data tagihan");
      return;
    }

    try {
      setSaving(true);

      // sesuaikan payload dengan backend kamu:
      // aku asumsi bills table punya: customer_id, pemakaian, tarif, total
      await billsApi.create({
        customer_id: selectedUser.id,
        pemakaian: Number(form.pemakaian),
        tarif,
        total,
      });

      setForm({ userId: "", pemakaian: "" });
      await fetchBills();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          JSON.stringify(err?.response?.data?.errors) ||
          "Gagal simpan tagihan"
      );
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Hapus tagihan ini?")) return;
    try {
      await billsApi.remove(id);
      fetchBills();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus tagihan");
    }
  }

  async function togglePaid(bill) {
    try {
      // kalau kamu pakai endpoint toggle:
      // await billsApi.togglePaid(bill.id);

      // kalau backend kamu pakai update biasa:
      await billsApi.update?.(bill.id, { paid: !bill.paid });

      fetchBills();
    } catch (err) {
      console.error(err);
      alert("Gagal ubah status");
    }
  }

  const normalizedBills = useMemo(() => {
    // support 2 bentuk data:
    // 1) bill.customer (relasi laravel load('customer'))
    // 2) bill.user (versi lama local)
    return bills.map((b) => {
      const customer = b.customer || b.user || null;
      return { ...b, customer };
    });
  }, [bills]);

  const filteredBills = useMemo(() => {
    let list = normalizedBills;

    if (filter === "paid") list = list.filter((b) => !!b.paid);
    if (filter === "unpaid") list = list.filter((b) => !b.paid);

    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter((b) =>
        [
          b.customer?.nama,
          b.customer?.nomor_kwh,
          b.customer?.alamat,
          b.customer?.no_hp,
          String(b.customer?.voltase),
          String(b.pemakaian),
          String(b.total),
          b.paid ? "lunas" : "belum",
        ]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(s))
      );
    }

    return list;
  }, [normalizedBills, filter, q]);

  const totalPendapatan = useMemo(
    () => normalizedBills.reduce((sum, b) => sum + Number(b.total || 0), 0),
    [normalizedBills]
  );

  const totalLunas = useMemo(
    () =>
      normalizedBills
        .filter((b) => !!b.paid)
        .reduce((sum, b) => sum + Number(b.total || 0), 0),
    [normalizedBills]
  );

  const isBusy = loadingUsers || loadingBills;

  return (
    <div className="min-h-screen bg-blue-50 flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Tagihan Listrik</h1>
            <p className="mt-1 text-sm text-blue-700/80">
              Buat tagihan, tandai lunas, dan cetak struk.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          {loadingBills ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <StatSkeleton />
              <StatSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <div className="text-xs text-gray-500">
                  Total Pendapatan (semua)
                </div>
                <div className="mt-1 text-lg font-bold text-blue-900">
                  Rp {totalPendapatan.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <div className="text-xs text-gray-500">Total Lunas</div>
                <div className="mt-1 text-lg font-bold text-blue-900">
                  Rp {totalLunas.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="mt-5 max-w-3xl">
          {loadingUsers ? (
            <FormSkeleton />
          ) : (
            <form
              onSubmit={submit}
              className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Pelanggan
                  </label>
                  <select
                    value={form.userId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, userId: e.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">-- pilih user --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama} ({u.nomor_kwh})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Pemakaian (kWh)
                  </label>
                  <input
                    type="number"
                    value={form.pemakaian}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pemakaian: e.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {selectedUser && (
                <div className="mt-4 text-sm text-gray-700">
                  Tarif: <b>Rp {tarif.toLocaleString("id-ID")}</b> / kWh <br />
                  Total:{" "}
                  <b className="text-blue-700">
                    Rp {total.toLocaleString("id-ID")}
                  </b>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className={
                  "mt-4 rounded-xl px-5 py-3 text-sm font-semibold text-white " +
                  (saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700")
                }
              >
                {saving ? "Menyimpan..." : "Simpan Tagihan"}
              </button>
            </form>
          )}
        </div>

        {/* FILTER + SEARCH */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-xl border bg-white p-1">
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
              Semua
            </FilterBtn>
            <FilterBtn
              active={filter === "unpaid"}
              onClick={() => setFilter("unpaid")}
            >
              Belum Lunas
            </FilterBtn>
            <FilterBtn active={filter === "paid"} onClick={() => setFilter("paid")}>
              Lunas
            </FilterBtn>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / no kWh / status..."
              className="w-full md:w-96 rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="button"
              onClick={() => {
                fetchUsers();
                fetchBills();
              }}
              className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-3 bg-white rounded-2xl border border-blue-100 p-4 shadow-sm overflow-x-auto">
          {loadingBills ? (
            <TableSkeleton />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 text-left">Nama</th>
                  <th className="py-3 text-left">No kWh</th>
                  <th className="py-3 text-left">Pemakaian</th>
                  <th className="py-3 text-left">Total</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((b) => (
                  <tr key={b.id} className="border-b last:border-b-0">
                    <td className="py-3">{b.customer?.nama || "-"}</td>
                    <td className="py-3">{b.customer?.nomor_kwh || "-"}</td>
                    <td className="py-3">{b.pemakaian} kWh</td>
                    <td className="py-3 font-semibold">
                      Rp {Number(b.total || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold " +
                          (b.paid
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200")
                        }
                      >
                        {b.paid ? "LUNAS" : "BELUM LUNAS"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link
                          to={`/receipt/${b.id}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
                        >
                          Struk
                        </Link>

                        <button
                          onClick={() => togglePaid(b)}
                          className={
                            "rounded-lg px-3 py-1.5 text-xs font-semibold " +
                            (b.paid
                              ? "border border-gray-200 hover:bg-gray-50"
                              : "bg-emerald-600 text-white hover:bg-emerald-700")
                          }
                        >
                          {b.paid ? "Batalkan" : "Tandai Lunas"}
                        </button>

                        <button
                          onClick={() => onDelete(b.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-gray-500">
                      Belum ada tagihan untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {!isBusy && (
            <div className="pt-4 text-xs text-gray-400">
              Menampilkan {filteredBills.length} data.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg px-3 py-2 text-xs font-semibold transition " +
        (active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50")
      }
    >
      {children}
    </button>
  );
}

/* -------------------- SKELETONS -------------------- */
function Skeleton({ className = "" }) {
  return (
    <div
      className={
        "animate-pulse rounded-lg bg-gray-200/80 " + className
      }
    />
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-3 h-7 w-28" />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-11 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-11 w-full" />
        </div>
      </div>
      <Skeleton className="mt-6 h-11 w-40" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div>
      <div className="border-b pb-3">
        <div className="grid grid-cols-6 gap-3 text-xs">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>

      <div className="pt-6">
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  );
}
