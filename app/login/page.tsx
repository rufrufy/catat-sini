import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth-card";
import { getOptionalUser } from "@/lib/supabase/server";

export default async function LoginPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/vault");
  }

  return (
    <div className="mx-auto min-h-screen max-w-[430px] px-5 pb-20 pt-8">
      <div className="mb-10">
        <p className="font-headline text-5xl font-extrabold tracking-tight text-primary">CatatSini</p>
        <h1 className="mt-6 max-w-[300px] font-headline text-5xl font-extrabold leading-tight text-on-surface">
          Masuk ke vault keuangan mobile Anda.
        </h1>
        <p className="mt-4 text-lg leading-8 text-on-surface-variant">
          Login atau daftar untuk mulai mencatat transaksi dengan AI, foto struk, suara, atau input manual.
        </p>
      </div>

      <AuthCard />
    </div>
  );
}
