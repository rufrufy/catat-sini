export function DemoBadge({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-tertiary-fixed/70 px-4 py-3 text-sm text-on-surface-variant">
      Mode demo aktif karena tabel Supabase belum terbaca. UI tetap jalan, tapi data contoh dipakai sebagai fallback.
    </div>
  );
}
