import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { inviteToWallet } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const walletId = String(payload.walletId ?? "");
  const email = String(payload.email ?? "");
  const result = await inviteToWallet(user, { walletId, email });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/account");

  return NextResponse.json({ ok: true, message: "Undangan berhasil dikirim." });
}
