"use client";

import { useMemo, useState } from "react";

import { AppIcon } from "@/components/app-icon";
import { formatCurrency, formatTime } from "@/lib/format";
import type { TransactionRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" }
] as const;

function groupLabel(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff =
    Math.floor(
      (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
        86400000
    ) || 0;

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function LedgerExplorer({ transactions }: { transactions: TransactionRecord[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");

  const grouped = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesFilter = filter === "all" ? true : transaction.type === filter;
      const matchesQuery =
        query.length === 0 ||
        transaction.title.toLowerCase().includes(query.toLowerCase()) ||
        transaction.categoryName.toLowerCase().includes(query.toLowerCase());

      return matchesFilter && matchesQuery;
    });

    return filtered.reduce<Record<string, TransactionRecord[]>>((accumulator, transaction) => {
      const label = groupLabel(transaction.occurredAt);
      accumulator[label] = accumulator[label] ?? [];
      accumulator[label]!.push(transaction);
      return accumulator;
    }, {});
  }, [filter, query, transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-[28px] bg-surface-container-lowest px-5 py-4 shadow-sm">
        <AppIcon className="h-6 w-6 text-on-surface-variant" name="search" />
        <input
          className="w-full bg-transparent text-xl text-on-surface outline-none placeholder:text-slate-400"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search transactions..."
          value={query}
        />
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item.key}
            className={cn(
              "rounded-full px-7 py-3 text-xl font-medium transition",
              filter === item.key ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"
            )}
            onClick={() => setFilter(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([label, items]) => (
          <section key={label} className="space-y-4">
            <h2 className="px-1 text-sm font-bold uppercase tracking-[0.32em] text-on-surface">{label}</h2>
            {items.map((transaction) => (
              <article
                key={transaction.id}
                className="flex items-center justify-between rounded-[28px] bg-surface-container-lowest p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-[24px]"
                    style={{ backgroundColor: transaction.categoryColor }}
                  >
                    <AppIcon className="h-7 w-7 text-on-surface-variant" name={transaction.categoryIcon} />
                  </div>
                  <div>
                    <h3 className="text-[2rem] font-semibold leading-tight text-on-surface">{transaction.title}</h3>
                    <p className="text-lg text-on-surface-variant">{transaction.categoryName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-[2rem] font-bold", transaction.type === "income" ? "text-primary" : "text-on-surface")}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-lg text-on-surface-variant">{formatTime(transaction.occurredAt)}</p>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
