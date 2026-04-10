import { AppIcon } from "@/components/app-icon";
import { LineTrendChart, DonutChart } from "@/components/charts";
import { DemoBadge } from "@/components/demo-badge";
import { MobileShell } from "@/components/mobile-shell";
import { getTrendsSnapshot } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";

export default async function TrendsPage() {
  const user = await requireUser();
  const { data, isDemo } = await getTrendsSnapshot(user);

  return (
    <MobileShell activeTab="trends" userLabel={user.email}>
      <DemoBadge show={isDemo} />

      <section className="flex items-center justify-between px-2">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-on-surface-variant">Month</p>
          <h1 className="font-headline text-5xl font-extrabold leading-tight text-on-surface">{data.monthLabel}</h1>
        </div>
        <div className="rounded-full bg-surface-container-lowest px-5 py-4 shadow-sm">
          <p className="text-lg text-on-surface">Select Month</p>
        </div>
      </section>

      <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-headline text-4xl font-bold text-on-surface">Category Distribution</h2>
        <p className="mt-2 text-lg leading-8 text-on-surface-variant">Detailed breakdown of your monthly outflow.</p>
        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <DonutChart segments={data.categoryTotals.map((item) => ({ value: item.value, color: item.color }))} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline text-5xl font-extrabold text-on-surface">{formatCurrency(data.totalSpent)}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-on-surface-variant">Total Spent</span>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {data.categoryTotals.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-lg text-on-surface">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
              <span className="text-xl font-semibold text-on-surface">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-surface-container p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-primary">
              <AppIcon className="h-5 w-5" name={data.topCategory.icon} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-on-surface-variant">Top Category</p>
              <p className="text-3xl font-semibold text-on-surface">{data.topCategory.label}</p>
            </div>
          </div>
          <span className="text-4xl font-bold text-on-surface">{data.topCategory.percentage}%</span>
        </div>
      </section>

      <section className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-on-surface-variant">Budget Status</p>
            <h2 className="text-4xl font-bold text-on-surface">{data.budgetStatus === "healthy" ? "On Track" : "Watch Closely"}</h2>
          </div>
          <span className="rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {data.budgetStatus}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(100, (data.totalSpent / 5500000) * 100)}%` }} />
        </div>
        <p className="mt-4 text-lg leading-8 text-on-surface-variant">
          Masih ada <span className="font-semibold text-primary">{formatCurrency(data.remainingBudget)}</span> sebelum menyentuh batas budget bulanan.
        </p>
      </section>

      <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-headline text-4xl font-bold text-on-surface">Spending Trend</h2>
            <p className="mt-2 text-lg leading-8 text-on-surface-variant">Daily activity across the last 30 days.</p>
          </div>
          <span className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-primary">Line</span>
        </div>
        <LineTrendChart data={data.lineData} />
      </section>

      <section className="rounded-[2.2rem] bg-brand-gradient p-6 text-on-primary">
        <h2 className="font-headline text-4xl font-bold">AI Plus Insight</h2>
        <p className="mt-4 max-w-[280px] text-lg leading-8 text-on-primary/85">
          Pengeluaran makan Anda 12% lebih hemat dari bulan lalu. Jika pola ini bertahan, target tabungan tahunan bisa tercapai lebih cepat.
        </p>
      </section>
    </MobileShell>
  );
}
