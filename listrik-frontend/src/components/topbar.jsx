export default function Topbar({ title, subtitle }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      <div className="rounded-2xl border bg-white px-4 py-2 text-sm text-zinc-600">
        Status: <span className="font-semibold text-green-600">Online</span>
      </div>
    </div>
  );
}
