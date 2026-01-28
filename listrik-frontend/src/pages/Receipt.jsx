import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { billsApi } from "../api/bills";

function formatTanggal(iso) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function rupiah(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

function padRight(str, len) {
  const s = String(str ?? "");
  return (s + " ".repeat(len)).slice(0, len);
}

function padLeft(str, len) {
  const s = String(str ?? "");
  return (" ".repeat(len) + s).slice(-len);
}

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await billsApi.show(id);
        if (!alive) return;
        setBill(res.data);
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setBill(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // ✅ HOOK AMAN: selalu kepanggil (walau bill masih null)
  const lines = useMemo(() => {
    if (!bill) return [];

    const customer = bill.customer;
    const kode = String(bill.id).padStart(8, "0");
    const tanggal = formatTanggal(bill.created_at);

    const lineWidth = 32; // untuk struk 58mm-ish (rapi monospace)
    const out = [];

    const hr = () => out.push("-".repeat(lineWidth));
    const dot = () => out.push(".".repeat(lineWidth));
    const center = (text) => {
      const t = String(text ?? "");
      const pad = Math.max(0, Math.floor((lineWidth - t.length) / 2));
      out.push(" ".repeat(pad) + t);
    };
    const kv = (k, v) => {
      out.push(`${padRight(k, 16)}${padLeft(v, 16)}`);
    };

    center("STRUK PEMBAYARAN");
    center("LISTRIK PASCABAYAR");
    hr();
    kv("Kode", kode);
    kv("Tanggal", tanggal);
    kv("Status", bill.paid ? "LUNAS" : "BELUM");
    if (bill.paid && bill.paid_at) kv("Tgl Lunas", formatTanggal(bill.paid_at));
    hr();

    out.push("PELANGGAN");
    dot();
    kv("Nama", customer?.nama || "-");
    kv("No kWh", customer?.nomor_kwh || "-");
    kv("Daya", customer ? `${customer.voltase} VA` : "-");
    kv("No HP", customer?.no_hp || "-");
    hr();

    out.push("RINCIAN");
    dot();
    kv("Pemakaian", `${bill.pemakaian} kWh`);
    kv("Tarif/kWh", rupiah(bill.tarif));
    hr();
    kv("TOTAL", rupiah(bill.total));
    hr();

    center("Simpan struk ini");
    center("sebagai bukti pembayaran");
    out.push("");
    out.push(`ID: ${bill.id}`);

    return out;
  }, [bill]);

  // ✅ Kondisional return aman (karena hooks udah lewat)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-6">
          <div className="text-lg font-bold text-gray-900">Memuat struk...</div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-6">
          <div className="text-lg font-bold text-gray-900">
            Struk tidak ditemukan
          </div>
          <button
            onClick={() => navigate("/bills")}
            className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // bill udah pasti ada
  const customer = bill.customer;
  const kode = String(bill.id).padStart(8, "0");
  const tanggal = formatTanggal(bill.created_at);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* TOP ACTIONS (tidak ikut print) */}
      <div className="mx-auto mb-4 flex max-w-lg items-center justify-between print:hidden">
        <button
          onClick={() => navigate("/bills")}
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          ← Kembali
        </button>

        <button
          onClick={() => window.print()}
          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Cetak
        </button>
      </div>

      {/* PREVIEW CARD (enak di layar) */}
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border bg-white p-4 shadow-sm print:border-0 print:shadow-none">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500">Struk</div>
              <div className="text-lg font-extrabold text-gray-900">
                Listrik Pascabayar
              </div>
              <div className="text-xs text-gray-500">
                Kode: <span className="font-semibold">{kode}</span>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  bill.paid
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-800"
                }`}
              >
                {bill.paid ? "LUNAS" : "BELUM LUNAS"}
              </div>
              <div className="mt-2 text-xs text-gray-500">{tanggal}</div>
              {bill.paid && bill.paid_at && (
                <div className="mt-1 text-[11px] text-gray-500">
                  Lunas: {formatTanggal(bill.paid_at)}
                </div>
              )}
            </div>
          </div>

          {/* STRUK THERMAL */}
          <div className="flex justify-center">
            <div
              className="w-[360px] rounded-xl border border-dashed bg-white p-4
                  print:w-auto print:border-0 print:p-0"
            >
              <style>{`
      @media print {
        @page { size: 80mm auto; margin: 6mm; }
        body { background: white !important; }
        .receipt-thermal {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }
      }
    `}</style>

              <pre className="receipt-thermal m-0 whitespace-pre-wrap text-[12px] leading-[1.25] text-black">
                {lines.join("\n")}
              </pre>
            </div>
          </div>

          {/* PANEL INFO (layar doang) */}
          <div className="mt-4 rounded-xl bg-gray-50 p-4 print:hidden">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Nama" value={customer?.nama} />
              <Info label="No. kWh" value={customer?.nomor_kwh} />
              <Info
                label="Daya"
                value={customer ? `${customer.voltase} VA` : "-"}
              />
              <Info label="No. HP" value={customer?.no_hp} />
            </div>
            <div className="mt-3 text-sm">
              <div className="text-xs text-gray-500">Alamat</div>
              <div className="font-medium text-gray-900">
                {customer?.alamat || "-"}
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="text-xs text-gray-500">TOTAL TAGIHAN</div>
              <div className="text-2xl font-extrabold text-gray-900">
                {rupiah(bill.total)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500 print:hidden">
            Simpan struk ini sebagai bukti pembayaran.
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value || "-"}</div>
    </div>
  );
}
