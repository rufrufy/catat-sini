import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { saveTransaction } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { transactionDraftSchema } from "@/lib/types";

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

  const payload = await request.json();
  const source = typeof payload.source === "string" ? payload.source : "manual";
  const draft = transactionDraftSchema.parse(payload.draft);
  const result = await saveTransaction(user, draft, source);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/vault");
  revalidatePath("/ledger");
  revalidatePath("/trends");

  return NextResponse.json({ ok: true });
}
