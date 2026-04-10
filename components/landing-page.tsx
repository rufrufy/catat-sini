import Link from "next/link";

import { AppIcon } from "@/components/app-icon";

export function LandingPage() {
  return (
    <div className="relative mx-auto min-h-screen max-w-[430px] px-5 pb-32 pt-5">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-on-primary shadow-veil">
            <AppIcon className="h-5 w-5" name="wallet" />
          </div>
          <div>
            <p className="font-headline text-[2rem] font-extrabold tracking-tight text-primary">CatatSini</p>
            <p className="-mt-1 text-xs uppercase tracking-[0.32em] text-on-surface-variant">Ethereal Vault</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-primary">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/80">
            <AppIcon className="h-5 w-5" name="bell" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-sm font-semibold text-primary">
            CS
          </div>
        </div>
      </header>

      <section className="mb-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-on-secondary-container">
          <AppIcon className="h-4 w-4" name="sparkles" />
          Financial Intelligence
        </div>
        <h1 className="max-w-[320px] font-headline text-5xl font-extrabold leading-[1.05] tracking-tight text-on-surface">
          Your Finances, <span className="italic text-primary">Simplified</span> by AI
        </h1>
        <p className="mt-5 max-w-[340px] text-xl leading-9 text-on-surface-variant">
          Catat pemasukan dan pengeluaran lewat chat, foto struk, suara, atau input manual tanpa ribet.
        </p>

        <Link
          className="mt-8 flex h-16 items-center justify-center gap-3 rounded-2xl bg-brand-gradient text-lg font-bold text-on-primary shadow-veil"
          href="/login"
        >
          Start Tracking
          <AppIcon className="h-5 w-5" name="chevron" />
        </Link>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <AppIcon className="h-4 w-4" name="mic" />
            Voice
          </div>
          <div className="flex items-center gap-2">
            <AppIcon className="h-4 w-4" name="camera" />
            Photo
          </div>
          <div className="flex items-center gap-2">
            <AppIcon className="h-4 w-4" name="sparkles" />
            Chat
          </div>
        </div>
      </section>

      <section className="relative mb-14 overflow-hidden rounded-[2rem] bg-surface-container-lowest p-6 shadow-ambient">
        <div className="absolute inset-x-10 bottom-28 h-44 rounded-[28px] bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-on-surface-variant">Total Net Worth</p>
            <h2 className="font-headline text-[3rem] font-extrabold tracking-tight text-on-surface">Rp124,5jt</h2>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">+12%</span>
        </div>
        <div className="relative h-48 overflow-hidden rounded-[28px] bg-surface-container-low">
          <svg className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 320 190">
            <path
              d="M0 135C28 131 60 125 86 135C112 145 128 160 150 146C178 128 194 72 227 42C254 17 286 28 320 65V190H0V135Z"
              fill="url(#veil)"
            />
            <path
              d="M0 135C28 131 60 125 86 135C112 145 128 160 150 146C178 128 194 72 227 42C254 17 286 28 320 65"
              stroke="#00685f"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <defs>
              <linearGradient id="veil" x1="160" x2="160" y1="22" y2="190">
                <stop stopColor="#00685f" stopOpacity="0.2" />
                <stop offset="1" stopColor="#00685f" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-[24px] bg-surface-container p-5">
            <AppIcon className="mb-3 h-5 w-5 text-primary" name="briefcase" />
            <p className="text-sm text-on-surface-variant">Liquid Assets</p>
            <p className="mt-1 text-2xl font-bold text-on-surface">Rp64,2jt</p>
          </div>
          <div className="rounded-[24px] bg-tertiary-fixed/30 p-5">
            <AppIcon className="mb-3 h-5 w-5 text-tertiary" name="trend" />
            <p className="text-sm text-on-surface-variant">Investments</p>
            <p className="mt-1 text-2xl font-bold text-on-surface">Rp78,3jt</p>
          </div>
        </div>
      </section>

      <section className="mb-16 grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-[2rem] bg-surface-container p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-headline text-3xl font-bold text-on-surface">Intelligent Ledger</h3>
              <p className="mt-3 text-base leading-8 text-on-surface-variant">
                AI membantu mengubah chat, foto struk, dan suara menjadi draft transaksi yang siap disimpan.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
              <AppIcon className="h-5 w-5" name="brain" />
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] bg-secondary-container/55 p-5">
          <AppIcon className="mb-3 h-5 w-5 text-secondary" name="shield" />
          <h4 className="text-xl font-bold text-on-surface">Secure Vault</h4>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">Supabase auth dan storage siap untuk deploy ke Vercel.</p>
        </div>
        <div className="rounded-[2rem] bg-tertiary-fixed/40 p-5">
          <AppIcon className="mb-3 h-5 w-5 text-tertiary" name="trend" />
          <h4 className="text-xl font-bold text-on-surface">Instant Insights</h4>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">Tren bulanan dan budget status selalu mudah dibaca dari mobile.</p>
        </div>
      </section>

      <section className="text-center">
        <p className="mb-6 text-[11px] uppercase tracking-[0.35em] text-slate-400">Trusted by modern mobile budgets</p>
        <div className="flex justify-between px-3 text-3xl font-extrabold italic text-slate-400/80">
          <span>FINTECH</span>
          <span>GLOBE</span>
          <span>ASSET</span>
        </div>
      </section>

      <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-end justify-between rounded-t-[32px] bg-surface/80 px-5 pb-6 pt-3 shadow-[0_-10px_40px_rgba(11,28,48,0.05)] backdrop-blur-xl">
        <div className="flex min-w-14 flex-col items-center justify-center rounded-2xl bg-primary/10 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          <AppIcon className="mb-1 h-5 w-5" name="wallet" />
          Vault
        </div>
        <div className="flex min-w-14 flex-col items-center justify-center px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          <AppIcon className="mb-1 h-5 w-5" name="receipt" />
          Ledger
        </div>
        <Link className="flex flex-col items-center justify-center" href="/login">
          <span className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-on-primary shadow-veil">
            <AppIcon className="h-8 w-8" name="plus" />
          </span>
        </Link>
        <div className="flex min-w-14 flex-col items-center justify-center px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          <AppIcon className="mb-1 h-5 w-5" name="chart" />
          Trends
        </div>
        <div className="flex min-w-14 flex-col items-center justify-center px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          <AppIcon className="mb-1 h-5 w-5" name="user" />
          Account
        </div>
      </div>
    </div>
  );
}
