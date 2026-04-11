import Link from "next/link";

import { AppIcon } from "@/components/app-icon";
import { cn } from "@/lib/utils";

type TabKey = "vault" | "ledger" | "add" | "trends" | "account";

const tabs: Array<{ key: TabKey; href: string; label: string; icon: string }> = [
  { key: "vault", href: "/vault", label: "Vault", icon: "wallet" },
  { key: "ledger", href: "/ledger", label: "Ledger", icon: "receipt" },
  { key: "add", href: "/add", label: "AI Plus", icon: "plus" },
  { key: "trends", href: "/trends", label: "Trends", icon: "chart" },
  { key: "account", href: "/account", label: "Account", icon: "user" }
];

export function MobileShell({
  activeTab,
  userLabel,
  children
}: {
  activeTab: TabKey;
  userLabel?: string | null;
  children: React.ReactNode;
}) {
  const initial = (userLabel?.[0] ?? "C").toUpperCase();

  return (
    <div className="relative mx-auto min-h-screen max-w-[430px] px-4 pb-32 pt-5">
      <header className="sticky top-0 z-40 mb-6 flex items-center justify-between rounded-[28px] bg-surface/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-sm font-semibold text-primary">
            {initial}
          </div>
          <div>
            <p className="font-headline text-[1.45rem] font-extrabold tracking-tight text-primary sm:text-[1.6rem]">CatatSini</p>
            <p className="-mt-1 text-xs uppercase tracking-[0.32em] text-on-surface-variant">Financial Intelligence</p>
          </div>
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
          <AppIcon className="h-5 w-5" name="bell" />
        </button>
      </header>

      <main className="space-y-6">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-end justify-between rounded-t-[32px] bg-surface/80 px-4 pb-6 pt-3 shadow-[0_-10px_40px_rgba(11,28,48,0.05)] backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          if (tab.key === "add") {
            return (
              <Link key={tab.key} className="flex flex-col items-center justify-center" href={tab.href}>
                <span className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-on-primary shadow-veil">
                  <AppIcon className="h-8 w-8" name={tab.icon} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.key}
              className={cn(
                "flex min-w-14 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] transition",
                isActive ? "bg-primary/10 text-primary" : "text-slate-400"
              )}
              href={tab.href}
            >
              <AppIcon className="mb-1 h-5 w-5" name={tab.icon} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
