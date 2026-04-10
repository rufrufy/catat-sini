import { categoryCatalog } from "@/lib/category-catalog";
import type { AccountOption, DashboardSnapshot, SelectOption, TransactionRecord, TrendsSnapshot, WalletInvite, WalletSummary } from "@/lib/types";

const now = new Date();

export const demoWallets: WalletSummary[] = [
  {
    id: "wallet-main",
    name: "Dompet Utama",
    description: "Dompet personal harian",
    role: "owner",
    memberCount: 1,
    pendingInviteCount: 1
  },
  {
    id: "wallet-family",
    name: "Dompet Rumah",
    description: "Budget keluarga dan tagihan rumah",
    role: "member",
    memberCount: 2,
    pendingInviteCount: 0
  }
];

export const demoCategories: SelectOption[] = categoryCatalog.map((category, index) => ({
  id: `cat-${index + 1}`,
  name: category.name,
  icon: category.icon,
  color: category.color,
  walletId: "wallet-main",
  groupName: category.groupName,
  categoryType: category.kind,
  sortOrder: category.sortOrder
}));

export const demoAccounts: AccountOption[] = [
  { id: "acc-main", name: "Cash Harian", kind: "cash", mask: null, walletId: "wallet-main", walletName: "Dompet Utama" },
  { id: "acc-bank", name: "BCA Everyday", kind: "bank", mask: "8842", walletId: "wallet-main", walletName: "Dompet Utama" },
  { id: "acc-wallet", name: "OVO", kind: "wallet", mask: "1188", walletId: "wallet-family", walletName: "Dompet Rumah" }
];

export const demoWalletInvites: WalletInvite[] = [
  {
    id: "invite-1",
    walletId: "wallet-main",
    walletName: "Dompet Utama",
    invitedEmail: "partner@example.com",
    role: "member",
    status: "pending",
    invitedBy: "you@example.com"
  }
];

export const demoTransactions: TransactionRecord[] = [
  {
    id: "trx-1",
    title: "Apple Store",
    amount: 1299000,
    type: "expense",
    notes: "Keyboard baru",
    occurredAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 20).toISOString(),
    categoryName: "Belanja",
    categoryIcon: "shopping-bag",
    categoryColor: "#dce9ff",
    accountName: "BCA Everyday",
    accountMask: "8842"
  },
  {
    id: "trx-2",
    title: "Monthly Salary",
    amount: 8450000,
    type: "income",
    notes: "Gaji bulanan",
    occurredAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
    categoryName: "Gaji Utama",
    categoryIcon: "briefcase",
    categoryColor: "#89f5e7",
    accountName: "BCA Everyday",
    accountMask: "8842"
  },
  {
    id: "trx-3",
    title: "Blue Bottle Coffee",
    amount: 42500,
    type: "expense",
    notes: "Cold brew",
    occurredAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 20, 15).toISOString(),
    categoryName: "Makan & Minum",
    categoryIcon: "coffee",
    categoryColor: "#c2ebe3",
    accountName: "OVO",
    accountMask: "1188"
  },
  {
    id: "trx-4",
    title: "Uber Premium",
    amount: 34200,
    type: "expense",
    notes: "Ke kantor",
    occurredAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18, 30).toISOString(),
    categoryName: "Transportasi",
    categoryIcon: "car",
    categoryColor: "#c2ebe3",
    accountName: "OVO",
    accountMask: "1188"
  },
  {
    id: "trx-5",
    title: "Luxury Estate Rent",
    amount: 3500000,
    type: "expense",
    notes: "Sewa apartemen",
    occurredAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 0, 1).toISOString(),
    categoryName: "Tempat Tinggal",
    categoryIcon: "house",
    categoryColor: "#ffdbce",
    accountName: "BCA Everyday",
    accountMask: "8842"
  }
];

export const demoDashboard: DashboardSnapshot = {
  netWorth: 124582400,
  monthlyIncome: 8240000,
  monthlyExpense: 3150000,
  savingsRate: 62,
  recentTransactions: demoTransactions.slice(0, 4)
};

export const demoTrends: TrendsSnapshot = {
  monthLabel: "April 2026",
  totalSpent: 4280000,
  budgetStatus: "healthy",
  remainingBudget: 1240000,
  categoryTotals: [
    { label: "Tempat Tinggal", value: 2100000, color: "#00685f", icon: "house" },
    { label: "Makan & Minum", value: 840000, color: "#b05e3d", icon: "coffee" },
    { label: "Transportasi", value: 420000, color: "#3f6560", icon: "car" }
  ],
  lineData: [28, 32, 36, 41, 29, 18, 25, 38],
  topCategory: { label: "Tempat Tinggal", percentage: 49, icon: "house" }
};
