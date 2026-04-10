"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AppIcon } from "@/components/app-icon";
import type { WalletInvite, WalletSummary } from "@/lib/types";

export function WalletManager({
  wallets,
  pendingInvites,
  outgoingInvites,
  isDemo
}: {
  wallets: WalletSummary[];
  pendingInvites: WalletInvite[];
  outgoingInvites: WalletInvite[];
  isDemo: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [walletName, setWalletName] = useState("");
  const [walletDescription, setWalletDescription] = useState("");
  const [inviteWalletId, setInviteWalletId] = useState(wallets.find((wallet) => wallet.role === "owner")?.id ?? wallets[0]?.id ?? "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const ownableWallets = useMemo(() => wallets.filter((wallet) => wallet.role === "owner"), [wallets]);

  async function createWallet() {
    startTransition(async () => {
      setStatus(null);
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: walletName,
          description: walletDescription
        })
      });
      const payload = await response.json();
      setStatus(payload.error ?? payload.message ?? "Dompet dibuat.");

      if (response.ok) {
        setWalletName("");
        setWalletDescription("");
        router.refresh();
      }
    });
  }

  async function inviteMember() {
    startTransition(async () => {
      setStatus(null);
      const response = await fetch("/api/wallet-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: inviteWalletId,
          email: inviteEmail
        })
      });
      const payload = await response.json();
      setStatus(payload.error ?? payload.message ?? "Undangan terkirim.");

      if (response.ok) {
        setInviteEmail("");
        router.refresh();
      }
    });
  }

  async function acceptInvite(inviteId: string) {
    startTransition(async () => {
      setStatus(null);
      const response = await fetch(`/api/wallet-invites/${inviteId}/accept`, {
        method: "POST"
      });
      const payload = await response.json();
      setStatus(payload.error ?? payload.message ?? "Undangan diterima.");

      if (response.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      {status ? <div className="rounded-[24px] bg-secondary-container/70 px-4 py-3 text-sm text-on-secondary-container">{status}</div> : null}
      {isDemo ? <div className="rounded-[24px] bg-tertiary-fixed/60 px-4 py-3 text-sm text-on-surface-variant">Wallet manager sedang tampil dalam mode demo.</div> : null}

      <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary">
            <AppIcon className="h-5 w-5" name="wallet" />
          </div>
          <div>
            <h2 className="font-headline text-3xl font-bold text-on-surface">Dompet Aktif</h2>
            <p className="text-sm text-on-surface-variant">Pisahkan keuangan personal, keluarga, atau proyek.</p>
          </div>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <article key={wallet.id} className="rounded-[24px] bg-surface-container-low p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-on-surface">{wallet.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">{wallet.description ?? "Dompet tanpa deskripsi."}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {wallet.role}
                </span>
              </div>
              <div className="mt-4 flex gap-3 text-sm text-on-surface-variant">
                <span>{wallet.memberCount} member</span>
                <span>{wallet.pendingInviteCount} invite pending</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-headline text-3xl font-bold text-on-surface">Buat Dompet Baru</h2>
        <div className="mt-4 space-y-3">
          <input
            className="h-14 w-full rounded-2xl bg-surface-container-low px-4 outline-none"
            onChange={(event) => setWalletName(event.target.value)}
            placeholder="Contoh: Dompet Liburan"
            value={walletName}
          />
          <textarea
            className="min-h-24 w-full rounded-2xl bg-surface-container-low px-4 py-3 outline-none"
            onChange={(event) => setWalletDescription(event.target.value)}
            placeholder="Keterangan singkat dompet"
            value={walletDescription}
          />
          <button
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-gradient text-base font-bold text-on-primary shadow-veil disabled:opacity-70"
            disabled={isPending || walletName.trim().length === 0}
            onClick={createWallet}
            type="button"
          >
            Buat Dompet
          </button>
        </div>
      </section>

      <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-headline text-3xl font-bold text-on-surface">Invite ke Dompet</h2>
        <div className="mt-4 space-y-3">
          <select
            className="h-14 w-full rounded-2xl bg-surface-container-low px-4 outline-none"
            onChange={(event) => setInviteWalletId(event.target.value)}
            value={inviteWalletId}
          >
            {ownableWallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          <input
            className="h-14 w-full rounded-2xl bg-surface-container-low px-4 outline-none"
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="email anggota"
            type="email"
            value={inviteEmail}
          />
          <button
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-on-surface text-base font-semibold text-white disabled:opacity-70"
            disabled={isPending || inviteEmail.trim().length === 0 || ownableWallets.length === 0}
            onClick={inviteMember}
            type="button"
          >
            Kirim Invite
          </button>
        </div>
      </section>

      {pendingInvites.length ? (
        <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-headline text-3xl font-bold text-on-surface">Invite Masuk</h2>
          <div className="mt-4 space-y-3">
            {pendingInvites.map((invite) => (
              <article key={invite.id} className="rounded-[24px] bg-surface-container-low p-4">
                <h3 className="text-xl font-semibold text-on-surface">{invite.walletName}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Diundang oleh {invite.invitedBy}</p>
                <button
                  className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-brand-gradient px-5 text-sm font-bold text-on-primary"
                  onClick={() => acceptInvite(invite.id)}
                  type="button"
                >
                  Terima Invite
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {outgoingInvites.length ? (
        <section className="rounded-[2.2rem] bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-headline text-3xl font-bold text-on-surface">Invite Terkirim</h2>
          <div className="mt-4 space-y-3">
            {outgoingInvites.map((invite) => (
              <article key={invite.id} className="rounded-[24px] bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-on-surface">{invite.walletName}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">{invite.invitedEmail}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {invite.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
