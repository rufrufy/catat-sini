import { MobileShell } from "@/components/mobile-shell";
import { signOutAction } from "@/lib/actions";
import { getDashboardSnapshot } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";

export default async function AccountPage() {
  const user = await requireUser();
  const { data } = await getDashboardSnapshot(user);

  return (
    <MobileShell activeTab="account" userLabel={user.email}>
      <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-2xl font-bold text-primary">
            {(user.email?.[0] ?? "C").toUpperCase()}
          </div>
          <div>
            <p className="font-headline text-4xl font-bold text-on-surface">Halo, {user.email?.split("@")[0]}</p>
            <p className="mt-2 text-lg text-on-surface-variant">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-[2rem] bg-surface-container p-5">
          <p className="text-sm uppercase tracking-[0.28em] text-on-surface-variant">Net Worth</p>
          <p className="mt-3 font-headline text-4xl font-bold text-on-surface">{formatCurrency(data.netWorth)}</p>
        </div>
        <div className="rounded-[2rem] bg-secondary-container/60 p-5">
          <p className="text-sm uppercase tracking-[0.28em] text-on-surface-variant">Savings Rate</p>
          <p className="mt-3 font-headline text-4xl font-bold text-on-surface">{data.savingsRate}%</p>
        </div>
      </section>

      <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-headline text-4xl font-bold text-on-surface">Deployment Stack</h2>
        <div className="mt-4 space-y-3 text-lg leading-8 text-on-surface-variant">
          <p>Next.js App Router untuk UI mobile-first.</p>
          <p>Supabase untuk auth dan database transaksi.</p>
          <p>Endpoint AI siap memakai env `AI_BASE_URL`, `AI_API_KEY`, dan `AI_MODEL`.</p>
          <p>Struktur aman untuk deploy ke Vercel sebagai satu aplikasi.</p>
        </div>
      </section>

      <form action={signOutAction}>
        <button className="flex h-14 w-full items-center justify-center rounded-2xl bg-on-surface text-lg font-semibold text-white" type="submit">
          Sign Out
        </button>
      </form>
    </MobileShell>
  );
}
