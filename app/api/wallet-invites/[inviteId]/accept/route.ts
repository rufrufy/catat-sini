import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { acceptWalletInvite } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(_: Request, context: { params: Promise<{ inviteId: string }> }) {
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

  const params = await context.params;
  const result = await acceptWalletInvite(user, params.inviteId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/account");
  revalidatePath("/add");
  revalidatePath("/vault");

  return NextResponse.json({ ok: true, message: "Invite berhasil diterima." });
}
