import { env, hasAiEnv } from "@/lib/env";
import { transactionDraftSchema, type DraftInputMode, type TransactionDraft } from "@/lib/types";

type ExtractionArgs = {
  mode: DraftInputMode;
  content: string;
  imageDataUrl?: string | null;
  categories: string[];
  accounts: string[];
};

function normalizeAmount(rawValue: string) {
  const cleaned = rawValue.replace(/[^\d.,]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function heuristicDraft({ content, categories, accounts }: ExtractionArgs): TransactionDraft {
  const amountMatch = content.match(/(?:rp|idr|\$)?\s?([\d.,]{2,})/i);
  const titleMatch = content.match(/(?:di|at|from)\s+([a-z0-9 '&.-]{3,})/i);
  const lowerContent = content.toLowerCase();
  const categoryLookup = categories.find((category) => lowerContent.includes(category.toLowerCase()));
  const inferredType = /(gaji|salary|bonus|income|dibayar|received|masuk)/i.test(content) ? "income" : "expense";

  return transactionDraftSchema.parse({
    title: titleMatch?.[1]?.trim() || (inferredType === "income" ? "Pemasukan baru" : "Transaksi baru"),
    amount: amountMatch ? normalizeAmount(amountMatch[1]!) || 42500 : 42500,
    type: inferredType,
    categoryName: categoryLookup ?? (inferredType === "income" ? "Salary" : "Dining & Drinks"),
    accountName: accounts[0] ?? "Dompet Utama",
    occurredAt: new Date().toISOString(),
    notes: content.trim(),
    confidence: 0.64,
    reasoning: "Draft dibuat dengan fallback parser lokal karena respons AI belum tersedia."
  });
}

function stripCodeFence(raw: string) {
  return raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

export async function extractTransactionDraft(args: ExtractionArgs): Promise<TransactionDraft> {
  if (!hasAiEnv()) {
    return heuristicDraft(args);
  }

  const systemPrompt = [
    "You are a finance extraction engine for an Indonesian personal finance app.",
    "Return only JSON with keys: title, amount, type, categoryName, accountName, occurredAt, notes, confidence, reasoning.",
    `Use one category from: ${args.categories.join(", ")}.`,
    `Use one account from: ${args.accounts.join(", ")}.`,
    "If you are unsure, choose the closest existing category/account and set confidence lower.",
    "occurredAt must be an ISO timestamp."
  ].join(" ");

  const userParts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
    {
      type: "text",
      text: `Input mode: ${args.mode}. Extract a draft transaction from this content: ${args.content || "No text provided."}`
    }
  ];

  if (args.imageDataUrl) {
    userParts.push({
      type: "image_url",
      image_url: {
        url: args.imageDataUrl
      }
    });
  }

  try {
    const response = await fetch(`${env.AI_BASE_URL!.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.AI_API_KEY!}`
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userParts }
        ]
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return heuristicDraft(args);
    }

    const payload = await response.json();
    const content = stripCodeFence(payload.choices?.[0]?.message?.content ?? "");
    const parsed = JSON.parse(content);
    return transactionDraftSchema.parse(parsed);
  } catch {
    return heuristicDraft(args);
  }
}
