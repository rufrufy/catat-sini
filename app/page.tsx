import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { getOptionalUser } from "@/lib/supabase/server";

export default async function HomePage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/vault");
  }

  return <LandingPage />;
}
