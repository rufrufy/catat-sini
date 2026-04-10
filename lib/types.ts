import { z } from "zod";

export type EntryMode = "ai" | "manual";
export type DraftInputMode = "chat" | "voice" | "photo";
export type TransactionType = "expense" | "income";

export type SelectOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
  walletId?: string;
  groupName?: string;
  categoryType?: "expense" | "income" | "saving";
  sortOrder?: number;
};

export type AccountOption = {
  id: string;
  name: string;
  kind: string;
  mask: string | null;
  walletId: string;
  walletName: string;
};

export type WalletSummary = {
  id: string;
  name: string;
  description: string | null;
  role: "owner" | "member";
  memberCount: number;
  pendingInviteCount: number;
};

export type WalletInvite = {
  id: string;
  walletId: string;
  walletName: string;
  invitedEmail: string;
  role: "member" | "viewer";
  status: "pending" | "accepted" | "declined";
  invitedBy: string;
};

export type TransactionRecord = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  notes: string | null;
  occurredAt: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  accountName: string;
  accountMask: string | null;
};

export type DashboardSnapshot = {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  recentTransactions: TransactionRecord[];
};

export type TrendsSnapshot = {
  monthLabel: string;
  totalSpent: number;
  budgetStatus: "healthy" | "watch";
  remainingBudget: number;
  categoryTotals: Array<{ label: string; value: number; color: string; icon: string }>;
  lineData: number[];
  topCategory: { label: string; percentage: number; icon: string };
};

export const transactionDraftSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(["expense", "income"]).default("expense"),
  categoryName: z.string().min(1),
  accountName: z.string().min(1),
  occurredAt: z.string().min(1),
  walletId: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  notes: z.string().optional().default(""),
  confidence: z.number().min(0).max(1).optional().default(0.78),
  reasoning: z.string().optional().default("")
});

export type TransactionDraft = z.infer<typeof transactionDraftSchema>;
