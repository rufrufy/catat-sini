"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureUserSetup } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function authAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const mode = String(formData.get("mode") ?? "signin");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase belum tersedia. Isi env terlebih dulu." };
  }

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/vault`
      }
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user && data.session) {
      await ensureUserSetup(data.user);
      redirect("/vault");
    }

    return { success: "Akun dibuat. Cek email untuk verifikasi lalu login." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureUserSetup(data.user);
    redirect("/vault");
  }

  return { error: "Gagal login. Coba lagi." };
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/");
}
