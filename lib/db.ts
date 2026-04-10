import { categoryCatalog } from "@/lib/category-catalog";
import { startOfMonth } from "@/lib/date";
import {
  demoAccounts,
  demoCategories,
  demoDashboard,
  demoTransactions,
  demoTrends,
  demoWalletInvites,
  demoWallets
} from "@/lib/demo-data";
import type {
  AccountOption,
  DashboardSnapshot,
  SelectOption,
  TransactionDraft,
  TransactionRecord,
  TrendsSnapshot,
  WalletInvite,
  WalletSummary
} from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type UserLike = { id: string; email?: string | null };

type TransactionRow = {
  id: string;
  title: string;
  amount: number | string;
  type: "income" | "expense";
  notes: string | null;
  occurred_at: string;
  category_id: string | null;
  account_id: string | null;
  wallet_id: string | null;
  categories?:
    | { id?: string | null; name?: string | null; icon?: string | null; color?: string | null }
    | Array<{ id?: string | null; name?: string | null; icon?: string | null; color?: string | null }>
    | null;
  accounts?:
    | { id?: string | null; name?: string | null; mask?: string | null }
    | Array<{ id?: string | null; name?: string | null; mask?: string | null }>
    | null;
  wallets?: { id?: string | null; name?: string | null } | Array<{ id?: string | null; name?: string | null }> | null;
};

type WalletMemberRow = {
  wallet_id: string;
  role: "owner" | "member";
  wallets?: { id: string; name: string; description: string | null } | Array<{ id: string; name: string; description: string | null }> | null;
};

type WalletInviteRow = {
  id: string;
  wallet_id: string;
  invited_email: string;
  role: "member" | "viewer";
  status: "pending" | "accepted" | "declined";
  wallets?: { name: string } | Array<{ name: string }> | null;
  profiles?: { email: string | null; full_name: string | null } | Array<{ email: string | null; full_name: string | null }> | null;
};

const defaultWallet = {
  name: "Dompet Utama",
  description: "Dompet personal utama untuk catatan keuangan harian"
};

const defaultAccounts = [
  { name: "Cash Harian", kind: "cash", mask: null, is_primary: true },
  { name: "BCA Everyday", kind: "bank", mask: "8842", is_primary: false },
  { name: "OVO", kind: "wallet", mask: "1188", is_primary: false }
];

const quickCategoryNames = ["Makan & Minum", "Tagihan Rutin", "Transportasi", "Belanja", "Gaji Utama", "Dana Darurat"];

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function getUserWalletIds(user: UserLike) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return demoWallets.map((wallet) => wallet.id);
  }

  const { data } = await supabase.from("wallet_members").select("wallet_id").eq("user_id", user.id);
  return data?.map((row) => row.wallet_id) ?? [];
}

export async function ensureUserSetup(user: UserLike) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: user.email?.split("@")[0] ?? "Catat Sini User"
    },
    { onConflict: "id" }
  );

  const { data: existingMemberships } = await supabase.from("wallet_members").select("wallet_id").eq("user_id", user.id).limit(1);

  let primaryWalletId = existingMemberships?.[0]?.wallet_id ?? null;

  if (!primaryWalletId) {
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .insert({
        owner_user_id: user.id,
        name: defaultWallet.name,
        description: defaultWallet.description
      })
      .select("id")
      .single();

    if (!walletError && wallet) {
      primaryWalletId = wallet.id;
      await supabase.from("wallet_members").upsert(
        {
          wallet_id: wallet.id,
          user_id: user.id,
          role: "owner",
          invited_by_user_id: user.id
        },
        { onConflict: "wallet_id,user_id" }
      );
    }
  }

  if (!primaryWalletId) {
    return;
  }

  await supabase.from("categories").update({ wallet_id: primaryWalletId }).eq("user_id", user.id).is("wallet_id", null);
  await supabase.from("accounts").update({ wallet_id: primaryWalletId }).eq("user_id", user.id).is("wallet_id", null);
  await supabase.from("transactions").update({ wallet_id: primaryWalletId }).eq("user_id", user.id).is("wallet_id", null);

  const { data: existingCategories } = await supabase.from("categories").select("id").eq("wallet_id", primaryWalletId).limit(1);

  if (!existingCategories?.length) {
    await supabase.from("categories").insert(
      categoryCatalog.map((category) => ({
        user_id: user.id,
        wallet_id: primaryWalletId,
        name: category.name,
        icon: category.icon,
        color: category.color,
        kind: category.kind,
        group_name: category.groupName,
        sort_order: category.sortOrder
      }))
    );
  }

  const { data: existingAccounts } = await supabase.from("accounts").select("id").eq("wallet_id", primaryWalletId).limit(1);

  if (!existingAccounts?.length) {
    await supabase.from("accounts").insert(
      defaultAccounts.map((account) => ({
        ...account,
        user_id: user.id,
        wallet_id: primaryWalletId
      }))
    );
  }
}

function mapTransaction(row: TransactionRow): TransactionRecord {
  const category = normalizeRelation(row.categories);
  const account = normalizeRelation(row.accounts);

  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    type: row.type,
    notes: row.notes,
    occurredAt: row.occurred_at,
    categoryName: category?.name ?? "Uncategorized",
    categoryIcon: category?.icon ?? "circle",
    categoryColor: category?.color ?? "#dce9ff",
    accountName: account?.name ?? "Cash Harian",
    accountMask: account?.mask ?? null
  };
}

export async function getSelectOptions(user: UserLike): Promise<{
  wallets: WalletSummary[];
  categories: SelectOption[];
  accounts: AccountOption[];
  isDemo: boolean;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { wallets: demoWallets, categories: demoCategories, accounts: demoAccounts, isDemo: true };
  }

  await ensureUserSetup(user);
  const wallets = await getWalletOverview(user);

  const walletIds = wallets.wallets.map((wallet) => wallet.id);

  const [{ data: categories, error: categoriesError }, { data: accounts, error: accountsError }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, icon, color, wallet_id, kind, group_name, sort_order")
      .in("wallet_id", walletIds)
      .order("sort_order")
      .order("name"),
    supabase.from("accounts").select("id, name, kind, mask, wallet_id").in("wallet_id", walletIds).order("is_primary", { ascending: false })
  ]);

  if (categoriesError || accountsError || !categories || !accounts) {
    return { wallets: demoWallets, categories: demoCategories, accounts: demoAccounts, isDemo: true };
  }

  const walletNameMap = new Map(wallets.wallets.map((wallet) => [wallet.id, wallet.name]));

  return {
    wallets: wallets.wallets,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      walletId: category.wallet_id,
      groupName: category.group_name,
      categoryType: category.kind,
      sortOrder: category.sort_order
    })),
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      kind: account.kind,
      mask: account.mask,
      walletId: account.wallet_id,
      walletName: walletNameMap.get(account.wallet_id) ?? "Dompet"
    })),
    isDemo: false
  };
}

export async function getWalletOverview(user: UserLike): Promise<{
  wallets: WalletSummary[];
  pendingInvites: WalletInvite[];
  outgoingInvites: WalletInvite[];
  isDemo: boolean;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase || !user.email) {
    return {
      wallets: demoWallets,
      pendingInvites: [],
      outgoingInvites: demoWalletInvites,
      isDemo: true
    };
  }

  await ensureUserSetup(user);

  const [{ data: membershipRows, error: membershipsError }, { data: incomingRows, error: incomingError }, { data: outgoingRows, error: outgoingError }] =
    await Promise.all([
      supabase.from("wallet_members").select("wallet_id, role, wallets(id, name, description)").eq("user_id", user.id),
      supabase
        .from("wallet_invites")
        .select("id, wallet_id, invited_email, role, status, wallets(name), profiles(email, full_name)")
        .eq("invited_email", user.email.toLowerCase())
        .eq("status", "pending"),
      supabase
        .from("wallet_invites")
        .select("id, wallet_id, invited_email, role, status, wallets(name), profiles(email, full_name)")
        .eq("invited_by_user_id", user.id)
        .order("created_at", { ascending: false })
    ]);

  if (membershipsError || incomingError || outgoingError || !membershipRows) {
    return {
      wallets: demoWallets,
      pendingInvites: [],
      outgoingInvites: demoWalletInvites,
      isDemo: true
    };
  }

  const walletIds = membershipRows.map((row) => row.wallet_id);
  const [{ data: memberCounts }, { data: inviteCounts }] = await Promise.all([
    supabase.from("wallet_members").select("wallet_id").in("wallet_id", walletIds),
    supabase.from("wallet_invites").select("wallet_id").in("wallet_id", walletIds).eq("status", "pending")
  ]);

  const memberCountMap = new Map<string, number>();
  memberCounts?.forEach((row) => {
    memberCountMap.set(row.wallet_id, (memberCountMap.get(row.wallet_id) ?? 0) + 1);
  });

  const inviteCountMap = new Map<string, number>();
  inviteCounts?.forEach((row) => {
    inviteCountMap.set(row.wallet_id, (inviteCountMap.get(row.wallet_id) ?? 0) + 1);
  });

  const wallets = membershipRows
    .map((row) => {
      const wallet = normalizeRelation((row as WalletMemberRow).wallets);

      if (!wallet) {
        return null;
      }

      return {
        id: wallet.id,
        name: wallet.name,
        description: wallet.description,
        role: row.role,
        memberCount: memberCountMap.get(wallet.id) ?? 1,
        pendingInviteCount: inviteCountMap.get(wallet.id) ?? 0
      } satisfies WalletSummary;
    })
    .filter((wallet): wallet is WalletSummary => Boolean(wallet));

  const mapInvite = (row: WalletInviteRow): WalletInvite => {
    const wallet = normalizeRelation(row.wallets);
    const inviter = normalizeRelation(row.profiles);
    return {
      id: row.id,
      walletId: row.wallet_id,
      walletName: wallet?.name ?? "Dompet",
      invitedEmail: row.invited_email,
      role: row.role,
      status: row.status,
      invitedBy: inviter?.full_name ?? inviter?.email ?? "Pengguna CatatSini"
    };
  };

  return {
    wallets,
    pendingInvites: incomingRows?.map((row) => mapInvite(row as WalletInviteRow)) ?? [],
    outgoingInvites: outgoingRows?.map((row) => mapInvite(row as WalletInviteRow)) ?? [],
    isDemo: false
  };
}

export async function getTransactions(user: UserLike): Promise<{ transactions: TransactionRecord[]; isDemo: boolean }> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { transactions: demoTransactions, isDemo: true };
  }

  await ensureUserSetup(user);
  const walletIds = await getUserWalletIds(user);

  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, title, amount, type, notes, occurred_at, category_id, account_id, wallet_id, categories(id, name, icon, color), accounts(id, name, mask), wallets(id, name)"
    )
    .in("wallet_id", walletIds)
    .order("occurred_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    return { transactions: demoTransactions, isDemo: true };
  }

  return { transactions: data.map((row) => mapTransaction(row as TransactionRow)), isDemo: false };
}

export async function getDashboardSnapshot(user: UserLike): Promise<{ data: DashboardSnapshot; isDemo: boolean }> {
  const { transactions, isDemo } = await getTransactions(user);

  if (isDemo) {
    return { data: demoDashboard, isDemo: true };
  }

  const monthStart = startOfMonth(new Date());
  const monthlyTransactions = transactions.filter((transaction) => new Date(transaction.occurredAt) >= monthStart);
  const monthlyIncome = monthlyTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyExpense = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const netWorth = transactions.reduce(
    (sum, transaction) => sum + (transaction.type === "income" ? transaction.amount : -transaction.amount),
    0
  );

  return {
    data: {
      netWorth,
      monthlyIncome,
      monthlyExpense,
      savingsRate: monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)) : 0,
      recentTransactions: transactions.slice(0, 4)
    },
    isDemo: false
  };
}

export async function getTrendsSnapshot(user: UserLike): Promise<{ data: TrendsSnapshot; isDemo: boolean }> {
  const { transactions, isDemo } = await getTransactions(user);

  if (isDemo) {
    return { data: demoTrends, isDemo: true };
  }

  const monthStart = startOfMonth(new Date());
  const monthTransactions = transactions.filter(
    (transaction) => transaction.type === "expense" && new Date(transaction.occurredAt) >= monthStart
  );

  const totalsByCategory = new Map<string, { total: number; color: string; icon: string }>();
  monthTransactions.forEach((transaction) => {
    const existing = totalsByCategory.get(transaction.categoryName);
    if (existing) {
      existing.total += transaction.amount;
    } else {
      totalsByCategory.set(transaction.categoryName, {
        total: transaction.amount,
        color: transaction.categoryColor,
        icon: transaction.categoryIcon
      });
    }
  });

  const categoryTotals = [...totalsByCategory.entries()]
    .map(([label, value]) => ({ label, value: value.total, color: value.color, icon: value.icon }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const totalSpent = categoryTotals.reduce((sum, item) => sum + item.value, 0);
  const topCategory = categoryTotals[0] ?? { label: "Belum ada data", percentage: 0, icon: "house" };

  const lineData = Array.from({ length: 8 }, (_, index) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (7 - index) * 4);
    return monthTransactions
      .filter((transaction) => new Date(transaction.occurredAt) <= cutoff)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  });

  return {
    data: {
      monthLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date()),
      totalSpent,
      budgetStatus: totalSpent < 5000000 ? "healthy" : "watch",
      remainingBudget: Math.max(0, 5500000 - totalSpent),
      categoryTotals,
      lineData,
      topCategory: {
        label: topCategory.label,
        percentage: totalSpent > 0 ? Math.round((categoryTotals[0]!.value / totalSpent) * 100) : 0,
        icon: topCategory.icon
      }
    },
    isDemo: false
  };
}

export async function saveTransaction(user: UserLike, draft: TransactionDraft, source = "manual") {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { ok: false, error: "Supabase belum aktif di environment." };
  }

  await ensureUserSetup(user);

  const { categories, accounts, wallets } = await getSelectOptions(user);
  const category =
    categories.find((item) => item.id === draft.categoryId) ??
    categories.find((item) => item.name.toLowerCase() === draft.categoryName.toLowerCase()) ??
    categories[0];
  const account =
    accounts.find((item) => item.id === draft.accountId) ??
    accounts.find((item) => item.name.toLowerCase() === draft.accountName.toLowerCase()) ??
    accounts[0];
  const walletId = draft.walletId ?? account?.walletId ?? category?.walletId ?? wallets[0]?.id;

  if (!walletId || !wallets.find((wallet) => wallet.id === walletId)) {
    return { ok: false, error: "Dompet tidak valid." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    wallet_id: walletId,
    category_id: category?.id,
    account_id: account?.id,
    title: draft.title,
    amount: draft.amount,
    type: draft.type,
    occurred_at: draft.occurredAt,
    notes: draft.notes || null,
    source
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function logAiExtraction(user: UserLike, payload: { input: string; output: TransactionDraft; source: string }) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.from("ai_extraction_logs").insert({
    user_id: user.id,
    source: payload.source,
    raw_input: payload.input,
    draft_payload: payload.output,
    confidence: payload.output.confidence
  });
}

export async function createWallet(user: UserLike, payload: { name: string; description?: string }) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { ok: false, error: "Supabase belum aktif." };
  }

  const { data: wallet, error } = await supabase
    .from("wallets")
    .insert({
      owner_user_id: user.id,
      name: payload.name,
      description: payload.description ?? null
    })
    .select("id")
    .single();

  if (error || !wallet) {
    return { ok: false, error: error?.message ?? "Gagal membuat dompet." };
  }

  await supabase.from("wallet_members").upsert(
    {
      wallet_id: wallet.id,
      user_id: user.id,
      role: "owner",
      invited_by_user_id: user.id
    },
    { onConflict: "wallet_id,user_id" }
  );

  await supabase.from("categories").insert(
    categoryCatalog.map((category) => ({
      user_id: user.id,
      wallet_id: wallet.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      kind: category.kind,
      group_name: category.groupName,
      sort_order: category.sortOrder
    }))
  );

  await supabase.from("accounts").insert(
    defaultAccounts.map((account) => ({
      ...account,
      user_id: user.id,
      wallet_id: wallet.id
    }))
  );

  return { ok: true };
}

export async function inviteToWallet(user: UserLike, payload: { walletId: string; email: string }) {
  const supabase = await createServerSupabaseClient();

  if (!supabase || !user.email) {
    return { ok: false, error: "Supabase belum aktif." };
  }

  const email = payload.email.toLowerCase().trim();
  const overview = await getWalletOverview(user);
  const wallet = overview.wallets.find((item) => item.id === payload.walletId);

  if (!wallet) {
    return { ok: false, error: "Dompet tidak ditemukan." };
  }

  if (wallet.role !== "owner") {
    return { ok: false, error: "Hanya owner yang bisa mengundang anggota." };
  }

  if (!email || email === user.email.toLowerCase()) {
    return { ok: false, error: "Masukkan email anggota lain yang valid." };
  }

  const existingInvite = overview.outgoingInvites.find(
    (invite) => invite.walletId === payload.walletId && invite.invitedEmail.toLowerCase() === email && invite.status === "pending"
  );

  if (existingInvite) {
    return { ok: false, error: "Email ini sudah punya undangan pending." };
  }

  const { error } = await supabase.from("wallet_invites").insert({
    wallet_id: payload.walletId,
    invited_email: email,
    invited_by_user_id: user.id,
    role: "member",
    status: "pending"
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function acceptWalletInvite(user: UserLike, inviteId: string) {
  const supabase = await createServerSupabaseClient();

  if (!supabase || !user.email) {
    return { ok: false, error: "Supabase belum aktif." };
  }

  const { data: invite, error } = await supabase
    .from("wallet_invites")
    .select("id, wallet_id, invited_email, role, status, invited_by_user_id")
    .eq("id", inviteId)
    .eq("invited_email", user.email.toLowerCase())
    .single();

  if (error || !invite) {
    return { ok: false, error: "Undangan tidak ditemukan." };
  }

  if (invite.status !== "pending") {
    return { ok: false, error: "Undangan ini sudah diproses." };
  }

  await supabase.from("wallet_members").upsert(
    {
      wallet_id: invite.wallet_id,
      user_id: user.id,
      role: invite.role,
      invited_by_user_id: invite.invited_by_user_id
    },
    { onConflict: "wallet_id,user_id" }
  );

  const { error: updateError } = await supabase
    .from("wallet_invites")
    .update({ status: "accepted" })
    .eq("id", inviteId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}

export function getQuickCategoryNames() {
  return quickCategoryNames;
}
