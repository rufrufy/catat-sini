import { env } from "@/lib/env";

function normalizeHost(hostOrUrl: string) {
  if (!hostOrUrl) {
    return "";
  }

  if (hostOrUrl.startsWith("http://") || hostOrUrl.startsWith("https://")) {
    return hostOrUrl.replace(/\/$/, "");
  }

  return `https://${hostOrUrl.replace(/\/$/, "")}`;
}

export function getAppUrl() {
  return (
    normalizeHost(env.NEXT_PUBLIC_APP_URL ?? "") ||
    normalizeHost(env.VERCEL_PROJECT_PRODUCTION_URL ?? "") ||
    normalizeHost(env.VERCEL_BRANCH_URL ?? "") ||
    normalizeHost(env.VERCEL_URL ?? "") ||
    "http://localhost:3000"
  );
}
