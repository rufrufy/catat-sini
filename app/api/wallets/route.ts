import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createWallet } from "@/lib/db";
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
  const name = String(payload.name ?? "").trim();
  const description = String(payload.description ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Nama dompet wajib diisi." }, { status: 400 });
  }

  const result = await createWallet(user, { name, description });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/account");
  revalidatePath("/add");

  return NextResponse.json({ ok: true, message: "Dompet baru berhasil dibuat." });
}
