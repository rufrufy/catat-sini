import { NextResponse } from "next/server";

import { extractTransactionDraft } from "@/lib/ai";
import { getSelectOptions, logAiExtraction } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DraftInputMode } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum tersedia." }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const mode = (body.mode as DraftInputMode) ?? "chat";
  const content = String(body.content ?? "");
  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : undefined;
  const { wallets, categories, accounts } = await getSelectOptions(user);

  const rawDraft = await extractTransactionDraft({
    mode,
    content,
    imageDataUrl,
    categories: categories.map((item) => item.name),
    accounts: accounts.map((item) => item.name)
  });

  const matchedCategory = categories.find((item) => item.name.toLowerCase() === rawDraft.categoryName.toLowerCase());
  const matchedAccount = accounts.find((item) => item.name.toLowerCase() === rawDraft.accountName.toLowerCase());
  const draft = {
    ...rawDraft,
    walletId: matchedAccount?.walletId ?? matchedCategory?.walletId ?? wallets[0]?.id,
    categoryId: matchedCategory?.id,
    accountId: matchedAccount?.id,
    categoryName: matchedCategory?.name ?? rawDraft.categoryName,
    accountName: matchedAccount?.name ?? rawDraft.accountName
  };

  await logAiExtraction(user, {
    input: content,
    output: draft,
    source: mode
  });

  return NextResponse.json({
    draft,
    message: "Draft berhasil dibuat. Silakan review sebelum simpan."
  });
}
