"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppIcon } from "@/components/app-icon";
import { formatCurrency } from "@/lib/format";
import type {
  AccountOption,
  DraftInputMode,
  SelectOption,
  TransactionDraft,
  TransactionType,
  WalletSummary
} from "@/lib/types";
import { cn } from "@/lib/utils";

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    SpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

const inputModes: Array<{ key: DraftInputMode; label: string; icon: string; description: string }> = [
  { key: "chat", label: "Chat", icon: "sparkles", description: "Tulis transaksi dengan bahasa natural." },
  { key: "photo", label: "Photo", icon: "camera", description: "Upload receipt dan draft langsung dibuat." },
  { key: "voice", label: "Voice", icon: "mic", description: "Rekam suara, transkrip dan draft otomatis." }
];

function datetimeLocalValue(dateString: string) {
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function createBlankDraft(wallets: WalletSummary[], categories: SelectOption[], accounts: AccountOption[]): TransactionDraft {
  const walletId = wallets[0]?.id;
  const account = accounts.find((item) => item.walletId === walletId) ?? accounts[0];
  const category =
    categories.find((item) => item.walletId === walletId && item.categoryType === "expense") ??
    categories.find((item) => item.walletId === walletId) ??
    categories[0];

  return {
    title: "New Transaction",
    amount: 42500,
    type: "expense",
    walletId,
    categoryId: category?.id,
    categoryName: category?.name ?? "Makan & Minum",
    accountId: account?.id,
    accountName: account?.name ?? "Cash Harian",
    occurredAt: new Date().toISOString(),
    notes: "",
    confidence: 1,
    reasoning: ""
  };
}

function categoryMatchesType(category: SelectOption, type: TransactionType) {
  if (type === "expense") {
    return category.categoryType === "expense" || category.categoryType === "saving";
  }

  return category.categoryType === "income";
}

export function TransactionComposer({
  wallets,
  categories,
  accounts,
  aiReady,
  isDemo
}: {
  wallets: WalletSummary[];
  categories: SelectOption[];
  accounts: AccountOption[];
  aiReady: boolean;
  isDemo: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">((searchParams.get("mode") as "ai" | "manual") ?? "ai");
  const [inputMode, setInputMode] = useState<DraftInputMode>((searchParams.get("input") as DraftInputMode) ?? "chat");
  const [prompt, setPrompt] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [draft, setDraft] = useState<TransactionDraft>(createBlankDraft(wallets, categories, accounts));
  const [manualDraft, setManualDraft] = useState<TransactionDraft>(createBlankDraft(wallets, categories, accounts));
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasGeneratedDraft, setHasGeneratedDraft] = useState(false);

  const activeDraft = mode === "ai" ? draft : manualDraft;
  const formattedAmount = useMemo(() => formatCurrency(activeDraft.amount || 0), [activeDraft.amount]);

  const aiCategories = useMemo(
    () => categories.filter((item) => item.walletId === draft.walletId && categoryMatchesType(item, draft.type)),
    [categories, draft.type, draft.walletId]
  );
  const manualCategories = useMemo(
    () => categories.filter((item) => item.walletId === manualDraft.walletId && categoryMatchesType(item, manualDraft.type)),
    [categories, manualDraft.type, manualDraft.walletId]
  );
  const aiAccounts = useMemo(() => accounts.filter((item) => item.walletId === draft.walletId), [accounts, draft.walletId]);
  const manualAccounts = useMemo(() => accounts.filter((item) => item.walletId === manualDraft.walletId), [accounts, manualDraft.walletId]);
  const manualQuickCategories = useMemo(() => manualCategories.slice(0, 6), [manualCategories]);

  async function requestDraftExtraction(targetMode: DraftInputMode, content: string, uploadedImageDataUrl?: string | null) {
    setIsExtracting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: targetMode,
          content,
          imageDataUrl: uploadedImageDataUrl
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus(payload.error ?? "Gagal membuat draft AI.");
        setHasGeneratedDraft(false);
        return;
      }

      setDraft(payload.draft);
      setHasGeneratedDraft(true);
      setStatus(payload.message ?? "Draft AI siap direview.");
    } catch {
      setStatus("Koneksi ke AI belum berhasil. Coba lagi sebentar.");
      setHasGeneratedDraft(false);
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleSave(source: "manual" | "ai") {
    setIsSaving(true);
    setStatus(null);

    try {
      const payload = source === "ai" ? draft : manualDraft;
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          draft: payload
        })
      });
      const result = await response.json();

      if (!response.ok) {
        setStatus(result.error ?? "Transaksi belum tersimpan.");
        return;
      }

      setStatus(source === "ai" ? "Draft AI berhasil disimpan." : "Transaksi manual berhasil ditambahkan.");
      router.push("/vault");
      router.refresh();
    } catch {
      setStatus("Ada kendala saat menyimpan transaksi.");
    } finally {
      setIsSaving(false);
    }
  }

  function switchAiMode(nextMode: DraftInputMode) {
    setInputMode(nextMode);
    setPrompt("");
    setImageDataUrl(null);
    setHasGeneratedDraft(false);
    setStatus(null);
  }

  function startVoiceCapture() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setStatus("Browser ini belum mendukung voice transcription.");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "id-ID";
    recognition.onresult = async (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setPrompt(transcript);
      setStatus("Suara berhasil ditranskrip. Draft AI sedang disiapkan.");
      await requestDraftExtraction("voice", transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function syncDependentFields(target: "ai" | "manual", nextWalletId: string, nextType: TransactionType) {
    const filteredCategories = categories.filter(
      (item) => item.walletId === nextWalletId && categoryMatchesType(item, nextType)
    );
    const filteredAccounts = accounts.filter((item) => item.walletId === nextWalletId);

    const nextCategory = filteredCategories[0];
    const nextAccount = filteredAccounts[0];

    const patch: Partial<TransactionDraft> = {
      walletId: nextWalletId,
      categoryId: nextCategory?.id,
      categoryName: nextCategory?.name ?? "",
      accountId: nextAccount?.id,
      accountName: nextAccount?.name ?? ""
    };

    if (target === "ai") {
      setDraft((current) => ({ ...current, ...patch }));
      return;
    }

    setManualDraft((current) => ({ ...current, ...patch }));
  }

  function updateDraft(target: "ai" | "manual", patch: Partial<TransactionDraft>) {
    if (target === "ai") {
      setDraft((current) => ({ ...current, ...patch }));
      return;
    }

    setManualDraft((current) => ({ ...current, ...patch }));
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Gagal membaca gambar."));
      reader.readAsDataURL(file);
    });

    setImageDataUrl(dataUrl);
    setStatus(`Receipt ${file.name} diupload. Draft AI sedang dibuat.`);
    await requestDraftExtraction("photo", `Receipt upload: ${file.name}`, dataUrl);
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto flex w-full max-w-xs rounded-[24px] bg-surface-container-low p-1">
        <button
          className={cn(
            "flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold transition",
            mode === "ai" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface"
          )}
          onClick={() => setMode("ai")}
          type="button"
        >
          AI EXTRACTION
        </button>
        <button
          className={cn(
            "flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold transition",
            mode === "manual" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface"
          )}
          onClick={() => setMode("manual")}
          type="button"
        >
          MANUAL ENTRY
        </button>
      </div>

      {status ? <div className="rounded-[24px] bg-secondary-container/70 px-4 py-3 text-sm text-on-secondary-container">{status}</div> : null}
      {isDemo ? <div className="rounded-[24px] bg-tertiary-fixed/60 px-4 py-3 text-sm text-on-surface-variant">Demo fallback aktif untuk data dompet, akun, dan kategori.</div> : null}

      {mode === "ai" ? (
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              {inputModes.map((item) => (
                <button
                  key={item.key}
                  className={cn(
                    "rounded-[24px] px-4 py-4 text-left transition",
                    item.key === inputMode ? "bg-brand-gradient text-on-primary shadow-veil" : "bg-surface-container-low text-on-surface"
                  )}
                  onClick={() => switchAiMode(item.key)}
                  type="button"
                >
                  <AppIcon className="mb-3 h-5 w-5" name={item.icon} />
                  <p className="text-base font-semibold">{item.label}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[28px] bg-surface-container-low p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-veil">
                  <AppIcon className="h-5 w-5" name={inputModes.find((item) => item.key === inputMode)?.icon ?? "sparkles"} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-on-surface">{inputModes.find((item) => item.key === inputMode)?.label}</p>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    {inputModes.find((item) => item.key === inputMode)?.description} {aiReady ? "" : "Fallback parser lokal akan dipakai jika AI belum aktif."}
                  </p>
                </div>
              </div>

              {inputMode === "chat" ? (
                <>
                  <textarea
                    className="h-32 w-full resize-none rounded-[24px] border border-outline-variant/20 bg-white px-4 py-3 text-base text-on-surface outline-none focus:border-primary"
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Contoh: bayar listrik rumah Rp350.000 dari BCA Everyday"
                    value={prompt}
                  />
                  <button
                    className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-brand-gradient text-base font-bold text-on-primary shadow-veil disabled:opacity-70"
                    disabled={isExtracting || prompt.trim().length === 0}
                    onClick={() => requestDraftExtraction("chat", prompt)}
                    type="button"
                  >
                    {isExtracting ? "Generating Draft..." : "Generate AI Draft"}
                  </button>
                </>
              ) : null}

              {inputMode === "photo" ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-primary/30 bg-white px-6 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-primary">
                    <AppIcon className="h-7 w-7" name="camera" />
                  </div>
                  <p className="mt-4 text-xl font-semibold text-on-surface">Upload receipt untuk generate otomatis</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">Pilih foto struk, lalu draft akan langsung dibuat tanpa langkah ekstra.</p>
                  <input accept="image/*" className="hidden" onChange={handleImageUpload} type="file" />
                  <span className="mt-5 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    {isExtracting ? "Sedang membaca receipt..." : imageDataUrl ? "Upload ulang" : "Pilih Foto"}
                  </span>
                </label>
              ) : null}

              {inputMode === "voice" ? (
                <div className="rounded-[28px] bg-white p-5">
                  <button
                    className={cn(
                      "flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition",
                      isListening ? "bg-tertiary text-on-tertiary" : "bg-brand-gradient text-on-primary shadow-veil"
                    )}
                    onClick={startVoiceCapture}
                    type="button"
                  >
                    <AppIcon className="h-5 w-5" name="mic" />
                    {isListening ? "Listening..." : "Mulai Rekam Suara"}
                  </button>
                  <div className="mt-4 rounded-[24px] bg-surface-container-low p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-on-surface-variant">Transkrip Terakhir</p>
                    <p className="mt-2 text-base leading-7 text-on-surface">{prompt || "Belum ada transkrip."}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {hasGeneratedDraft ? (
            <section className="rounded-[2.4rem] bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-4">
                <h2 className="font-headline text-4xl font-bold leading-tight text-on-surface">Review Draft</h2>
                <div className="flex rounded-2xl bg-surface-container p-1">
                  {(["expense", "income"] as TransactionType[]).map((item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-[14px] px-4 py-2 text-sm font-semibold uppercase transition",
                        draft.type === item ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface"
                      )}
                      onClick={() => {
                        const nextType = item;
                        const nextCategories = categories.filter(
                          (category) => category.walletId === draft.walletId && categoryMatchesType(category, nextType)
                        );
                        updateDraft("ai", {
                          type: nextType,
                          categoryId: nextCategories[0]?.id,
                          categoryName: nextCategories[0]?.name ?? draft.categoryName
                        });
                      }}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-4 text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-on-surface-variant">Total Amount</p>
                <p className="mt-3 font-headline text-6xl font-extrabold tracking-tight text-on-surface">{formattedAmount}</p>
              </div>

              <div className="space-y-4">
                <FieldCard icon="wallet" label="Dompet">
                  <select
                    className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                    onChange={(event) => syncDependentFields("ai", event.target.value, draft.type)}
                    value={draft.walletId}
                  >
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </FieldCard>
                <FieldCard icon="sparkles" label="Title">
                  <input
                    className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                    onChange={(event) => updateDraft("ai", { title: event.target.value })}
                    value={draft.title}
                  />
                </FieldCard>
                <FieldCard icon="wallet" label="Amount">
                  <input
                    className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                    onChange={(event) => updateDraft("ai", { amount: Number(event.target.value || 0) })}
                    type="number"
                    value={draft.amount}
                  />
                </FieldCard>
                <FieldCard icon="coffee" label="Category">
                  <select
                    className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                    onChange={(event) => {
                      const nextCategory = aiCategories.find((item) => item.id === event.target.value);
                      updateDraft("ai", {
                        categoryId: nextCategory?.id,
                        categoryName: nextCategory?.name ?? draft.categoryName
                      });
                    }}
                    value={draft.categoryId}
                  >
                    {renderCategoryOptions(aiCategories)}
                  </select>
                </FieldCard>
                <FieldCard icon="briefcase" label="Payment Account">
                  <select
                    className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                    onChange={(event) => {
                      const nextAccount = aiAccounts.find((item) => item.id === event.target.value);
                      updateDraft("ai", {
                        accountId: nextAccount?.id,
                        accountName: nextAccount?.name ?? draft.accountName
                      });
                    }}
                    value={draft.accountId}
                  >
                    {aiAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </FieldCard>
                <FieldCard icon="chart" label="Transaction Date">
                  <input
                    className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                    onChange={(event) => updateDraft("ai", { occurredAt: new Date(event.target.value).toISOString() })}
                    type="datetime-local"
                    value={datetimeLocalValue(draft.occurredAt)}
                  />
                </FieldCard>
                <FieldCard icon="receipt" label="Notes">
                  <textarea
                    className="min-h-20 w-full resize-none bg-transparent text-lg text-on-surface outline-none"
                    onChange={(event) => updateDraft("ai", { notes: event.target.value })}
                    placeholder="Tambahkan catatan kalau perlu"
                    value={draft.notes}
                  />
                </FieldCard>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  className="flex h-16 w-full items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-on-primary shadow-veil disabled:opacity-70"
                  disabled={isSaving}
                  onClick={() => handleSave("ai")}
                  type="button"
                >
                  {isSaving ? "Saving..." : "Save Transaction"}
                </button>
                <button
                  className="flex h-14 w-full items-center justify-center rounded-2xl border border-outline-variant/40 bg-transparent text-base font-semibold text-on-surface"
                  onClick={() => {
                    setDraft(createBlankDraft(wallets, categories, accounts));
                    setHasGeneratedDraft(false);
                  }}
                  type="button"
                >
                  Reset Draft
                </button>
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <section className="rounded-[2.4rem] bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 className="font-headline text-4xl font-bold leading-tight text-on-surface">New Transaction</h2>
            <div className="flex rounded-2xl bg-surface-container p-1">
              {(["expense", "income"] as TransactionType[]).map((item) => (
                <button
                  key={item}
                  className={cn(
                    "rounded-[14px] px-4 py-2 text-sm font-semibold uppercase transition",
                    manualDraft.type === item ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface"
                  )}
                  onClick={() => {
                    const nextCategories = categories.filter(
                      (category) => category.walletId === manualDraft.walletId && categoryMatchesType(category, item)
                    );
                    updateDraft("manual", {
                      type: item,
                      categoryId: nextCategories[0]?.id,
                      categoryName: nextCategories[0]?.name ?? manualDraft.categoryName
                    });
                  }}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="py-4 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-on-surface-variant">Total Amount</p>
            <input
              className="mt-3 w-full bg-transparent text-center font-headline text-6xl font-extrabold tracking-tight text-on-surface outline-none"
              onChange={(event) => updateDraft("manual", { amount: Number(event.target.value || 0) })}
              type="number"
              value={manualDraft.amount}
            />
          </div>

          <div className="space-y-5">
            <FieldCard icon="wallet" label="Dompet">
              <select
                className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                onChange={(event) => syncDependentFields("manual", event.target.value, manualDraft.type)}
                value={manualDraft.walletId}
              >
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </FieldCard>

            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.28em] text-on-surface">Quick Category</p>
              <div className="grid grid-cols-3 gap-3">
                {manualQuickCategories.map((category) => (
                  <button
                    key={category.id}
                    className={cn(
                      "rounded-[24px] px-3 py-4 text-center text-sm font-semibold shadow-sm transition",
                      manualDraft.categoryId === category.id ? "bg-brand-gradient text-on-primary shadow-veil" : "bg-surface-container text-on-surface"
                    )}
                    onClick={() =>
                      updateDraft("manual", {
                        categoryId: category.id,
                        categoryName: category.name
                      })
                    }
                    type="button"
                  >
                    <div className="mb-2 flex items-center justify-center">
                      <AppIcon className="h-5 w-5" name={category.icon} />
                    </div>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <FieldCard icon="coffee" label="Semua Kategori">
              <select
                className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                onChange={(event) => {
                  const nextCategory = manualCategories.find((item) => item.id === event.target.value);
                  updateDraft("manual", {
                    categoryId: nextCategory?.id,
                    categoryName: nextCategory?.name ?? manualDraft.categoryName
                  });
                }}
                value={manualDraft.categoryId}
              >
                {renderCategoryOptions(manualCategories)}
              </select>
            </FieldCard>

            <FieldCard icon="sparkles" label="Title">
              <input
                className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                onChange={(event) => updateDraft("manual", { title: event.target.value })}
                value={manualDraft.title}
              />
            </FieldCard>
            <FieldCard icon="chart" label="Transaction Date">
              <input
                className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                onChange={(event) => updateDraft("manual", { occurredAt: new Date(event.target.value).toISOString() })}
                type="datetime-local"
                value={datetimeLocalValue(manualDraft.occurredAt)}
              />
            </FieldCard>
            <FieldCard icon="briefcase" label="Payment Account">
              <select
                className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                onChange={(event) => {
                  const nextAccount = manualAccounts.find((item) => item.id === event.target.value);
                  updateDraft("manual", {
                    accountId: nextAccount?.id,
                    accountName: nextAccount?.name ?? manualDraft.accountName
                  });
                }}
                value={manualDraft.accountId}
              >
                {manualAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </FieldCard>
            <FieldCard icon="receipt" label="Optional Notes">
              <textarea
                className="min-h-24 w-full resize-none bg-transparent text-lg text-on-surface outline-none"
                onChange={(event) => updateDraft("manual", { notes: event.target.value })}
                placeholder="What was this for?"
                value={manualDraft.notes}
              />
            </FieldCard>
          </div>

          <div className="mt-8 space-y-4">
            <button
              className="flex h-16 w-full items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-on-primary shadow-veil disabled:opacity-70"
              disabled={isSaving}
              onClick={() => handleSave("manual")}
              type="button"
            >
              {isSaving ? "Saving..." : "Save Transaction"}
            </button>
            <button
              className="w-full text-center text-lg font-medium text-on-surface-variant"
              onClick={() => setManualDraft(createBlankDraft(wallets, categories, accounts))}
              type="button"
            >
              Clear Form
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function renderCategoryOptions(items: SelectOption[]) {
  const groups = items.reduce<Record<string, SelectOption[]>>((accumulator, item) => {
    const key = item.groupName ?? "Lainnya";
    accumulator[key] = accumulator[key] ?? [];
    accumulator[key]!.push(item);
    return accumulator;
  }, {});

  return Object.entries(groups).map(([groupName, groupItems]) => (
    <optgroup key={groupName} label={groupName}>
      {groupItems.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </optgroup>
  ));
}

function FieldCard({
  label,
  icon,
  children
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] bg-surface-container-low p-5">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <AppIcon className="h-5 w-5" name={icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] uppercase tracking-[0.28em] text-on-surface-variant">{label}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
