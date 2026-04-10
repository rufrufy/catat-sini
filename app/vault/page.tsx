import Link from "next/link";

import { AppIcon } from "@/components/app-icon";
import { DemoBadge } from "@/components/demo-badge";
import { MobileShell } from "@/components/mobile-shell";
import { getDashboardSnapshot } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";

export default async function VaultPage() {
  const user = await requireUser();
  const { data, isDemo } = await getDashboardSnapshot(user);

  return (
    <MobileShell activeTab="vault" userLabel={user.email}>
      <DemoBadge show={isDemo} />

      <section className="relative overflow-hidden rounded-[2.2rem] bg-brand-gradient p-8 text-on-primary shadow-veil">
        <div className="absolute right-[-3rem] top-[-4rem] h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm uppercase tracking-[0.32em] text-on-primary/70">Current Net Worth</p>
        <h1 className="mt-3 font-headline text-[3.8rem] font-extrabold leading-none tracking-tight">{formatCurrency(data.netWorth)}</h1>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-on-primary/75">Monthly Income</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(data.monthlyIncome)}</p>
          </div>
          <div className="rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-on-primary/75">Monthly Expense</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(data.monthlyExpense)}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        <QuickLink href="/add?mode=ai&input=chat" icon="sparkles" label="Ask AI" />
        <QuickLink href="/add?mode=ai&input=photo" icon="camera" label="Scan Receipt" />
        <QuickLink href="/add?mode=ai&input=voice" icon="mic" label="Voice Note" />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <h2 className="font-headline text-4xl font-bold text-on-surface">Financial Health</h2>
          <Link className="text-lg font-medium text-primary" href="/trends">
            View Insights
          </Link>
        </div>

        <div className="rounded-[2rem] bg-surface-container p-6">
          <p className="text-sm uppercase tracking-[0.32em] text-on-surface">Saving Goal</p>
          <p className="mt-2 font-headline text-5xl font-bold text-on-surface">Emergency Fund</p>
          <div className="mt-6">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{data.savingsRate}%</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(100, data.savingsRate)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <h2 className="font-headline text-4xl font-bold text-on-surface">Recent Activity</h2>
          <Link className="text-lg font-medium text-slate-400" href="/ledger">
            All Ledger
          </Link>
        </div>

        <div className="space-y-3">
          {data.recentTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="flex items-center justify-between rounded-[28px] bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: transaction.categoryColor }}
                >
                  <AppIcon className="h-6 w-6 text-on-surface-variant" name={transaction.categoryIcon} />
                </div>
                <div>
                  <h3 className="text-[1.9rem] font-semibold leading-tight text-on-surface">{transaction.title}</h3>
                  <p className="text-lg text-on-surface-variant">{transaction.categoryName}</p>
                </div>
              </div>
              <p className={`text-[2rem] font-bold ${transaction.type === "income" ? "text-primary" : "text-on-surface"}`}>
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link className="rounded-[28px] bg-surface-container-lowest p-4 text-center shadow-sm" href={href}>
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary">
        <AppIcon className="h-6 w-6" name={icon} />
      </div>
      <p className="text-lg font-semibold text-on-surface">{label}</p>
    </Link>
  );
}
