import { DemoBadge } from "@/components/demo-badge";
import { LedgerExplorer } from "@/components/ledger-explorer";
import { MobileShell } from "@/components/mobile-shell";
import { getTransactions } from "@/lib/db";
import { requireUser } from "@/lib/supabase/server";

export default async function LedgerPage() {
  const user = await requireUser();
  const { transactions, isDemo } = await getTransactions(user);

  return (
    <MobileShell activeTab="ledger" userLabel={user.email}>
      <DemoBadge show={isDemo} />
      <LedgerExplorer transactions={transactions} />
    </MobileShell>
  );
}
