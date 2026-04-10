"use client";

import { useActionState, useState } from "react";

import { authAction, type AuthState } from "@/lib/actions";
import { cn } from "@/lib/utils";

const initialState: AuthState = {};

export function AuthCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, formAction, pending] = useActionState(authAction, initialState);

  return (
    <div className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-ambient">
      <div className="mb-6 flex rounded-2xl bg-surface-container-low p-1">
        {[
          { key: "signin", label: "Login" },
          { key: "signup", label: "Daftar" }
        ].map((item) => (
          <button
            key={item.key}
            className={cn(
              "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition",
              mode === item.key ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"
            )}
            onClick={() => setMode(item.key as "signin" | "signup")}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-4">
        <input name="mode" type="hidden" value={mode} />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface">Email</label>
          <input
            className="h-14 w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 text-base text-on-surface outline-none transition focus:border-primary focus:bg-white"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface">Password</label>
          <input
            className="h-14 w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 text-base text-on-surface outline-none transition focus:border-primary focus:bg-white"
            minLength={6}
            name="password"
            placeholder="Minimal 6 karakter"
            required
            type="password"
          />
        </div>

        {state.error ? <p className="rounded-2xl bg-error-container px-4 py-3 text-sm text-error">{state.error}</p> : null}
        {state.success ? (
          <p className="rounded-2xl bg-secondary-container px-4 py-3 text-sm text-on-secondary-container">{state.success}</p>
        ) : null}

        <button
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-gradient text-base font-bold text-on-primary shadow-veil disabled:opacity-70"
          disabled={pending}
          type="submit"
        >
          {pending ? "Memproses..." : mode === "signin" ? "Masuk ke Vault" : "Buat Akun"}
        </button>
      </form>
    </div>
  );
}
