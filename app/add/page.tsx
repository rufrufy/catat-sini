import { DemoBadge } from "@/components/demo-badge";
import { MobileShell } from "@/components/mobile-shell";
import { TransactionComposer } from "@/components/transaction-composer";
import { getSelectOptions } from "@/lib/db";
import { hasAiEnv } from "@/lib/env";
import { requireUser } from "@/lib/supabase/server";

export default async function AddTransactionPage() {
  const user = await requireUser();
  const { categories, accounts, isDemo } = await getSelectOptions(user);

  return (
    <MobileShell activeTab="add" userLabel={user.email}>
      <DemoBadge show={isDemo} />
      <TransactionComposer accounts={accounts} aiReady={hasAiEnv()} categories={categories} isDemo={isDemo} />
    </MobileShell>
  );
}
