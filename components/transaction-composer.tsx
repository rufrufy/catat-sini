"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppIcon } from "@/components/app-icon";
import { formatCurrency } from "@/lib/format";
import type { AccountOption, DraftInputMode, SelectOption, TransactionDraft, TransactionType } from "@/lib/types";
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

const inputModes: Array<{ key: DraftInputMode; label: string; icon: string }> = [
  { key: "chat", label: "Chat", icon: "sparkles" },
  { key: "photo", label: "Photo", icon: "camera" },
  { key: "voice", label: "Voice", icon: "mic" }
];

function datetimeLocalValue(dateString: string) {
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function createBlankDraft(categories: SelectOption[], accounts: AccountOption[]): TransactionDraft {
  return {
    title: "New Transaction",
    amount: 42500,
    type: "expense",
    categoryName: categories[0]?.name ?? "Dining & Drinks",
    accountName: accounts[0]?.name ?? "Dompet Utama",
    occurredAt: new Date().toISOString(),
    notes: "",
    confidence: 1,
    reasoning: ""
  };
}

export function TransactionComposer({
  categories,
  accounts,
  aiReady,
  isDemo
}: {
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
  const [draft, setDraft] = useState<TransactionDraft>(createBlankDraft(categories, accounts));
  const [manualDraft, setManualDraft] = useState<TransactionDraft>(createBlankDraft(categories, accounts));
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const activeDraft = mode === "ai" ? draft : manualDraft;
  const formattedAmount = useMemo(() => formatCurrency(activeDraft.amount || 0), [activeDraft.amount]);

  async function handleExtract() {
    setIsExtracting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: inputMode,
          content: prompt,
          imageDataUrl
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus(payload.error ?? "Gagal membuat draft AI.");
        return;
      }

      setDraft(payload.draft);
      setStatus(payload.message ?? "Draft AI siap direview.");
    } catch {
      setStatus("Koneksi ke AI belum berhasil. Coba lagi sebentar.");
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
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setPrompt(transcript);
      setInputMode("voice");
      setStatus("Transkrip suara berhasil diambil. Lanjutkan ke extract draft.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
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
    setInputMode("photo");
    setStatus(`Gambar ${file.name} siap dianalisis.`);
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
      {isDemo ? <div className="rounded-[24px] bg-tertiary-fixed/60 px-4 py-3 text-sm text-on-surface-variant">Demo fallback aktif untuk data akun dan kategori.</div> : null}

      {mode === "ai" ? (
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-5 flex gap-3">
              {inputModes.map((item) => (
                <button
                  key={item.key}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    item.key === inputMode ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"
                  )}
                  onClick={() => setInputMode(item.key)}
                  type="button"
                >
                  <AppIcon className="h-4 w-4" name={item.icon} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="rounded-[28px] bg-surface-container-low p-5">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-veil">
                  <AppIcon className="h-5 w-5" name="sparkles" />
                </div>
                <div>
                  <p className="text-lg leading-8 text-on-surface">
                    Analyzing receipt atau chat Anda, lalu mengubahnya menjadi draft transaksi yang siap direview.
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.28em] text-on-surface-variant">
                    {aiReady ? "AI READY" : "Fallback parser aktif"}
                  </p>
                </div>
              </div>

              <textarea
                className="h-32 w-full resize-none rounded-[24px] border border-outline-variant/20 bg-white px-4 py-3 text-base text-on-surface outline-none focus:border-primary"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Contoh: makan siang di Blue Bottle Rp42.500 pakai OVO"
                value={prompt}
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface">
                  <AppIcon className="h-4 w-4" name="image" />
                  Upload Receipt
                  <input accept="image/*" className="hidden" onChange={handleImageUpload} type="file" />
                </label>
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold",
                    isListening ? "bg-tertiary text-on-tertiary" : "bg-surface-container text-on-surface"
                  )}
                  onClick={startVoiceCapture}
                  type="button"
                >
                  <AppIcon className="h-4 w-4" name="mic" />
                  {isListening ? "Listening..." : "Voice to Text"}
                </button>
              </div>

              <button
                className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-brand-gradient text-base font-bold text-on-primary shadow-veil disabled:opacity-70"
                disabled={isExtracting}
                onClick={handleExtract}
                type="button"
              >
                {isExtracting ? "Generating Draft..." : "Generate AI Draft"}
              </button>
            </div>
          </section>

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
                    onClick={() => updateDraft("ai", { type: item })}
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
                  onChange={(event) => updateDraft("ai", { categoryName: event.target.value })}
                  value={draft.categoryName}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FieldCard>
              <FieldCard icon="briefcase" label="Payment Account">
                <select
                  className="w-full bg-transparent text-xl font-semibold text-on-surface outline-none"
                  onChange={(event) => updateDraft("ai", { accountName: event.target.value })}
                  value={draft.accountName}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.name}>
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
                onClick={() => setDraft(createBlankDraft(categories, accounts))}
                type="button"
              >
                Reset Draft
              </button>
            </div>
          </section>
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
                  onClick={() => updateDraft("manual", { type: item })}
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
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.28em] text-on-surface">Select Category</p>
              <div className="grid grid-cols-4 gap-3">
                {categories.slice(0, 4).map((category) => (
                  <button
                    key={category.id}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center gap-2 rounded-[24px] px-2 text-center text-sm font-semibold shadow-sm transition",
                      manualDraft.categoryName === category.name
                        ? "bg-brand-gradient text-on-primary shadow-veil"
                        : "bg-surface-container text-on-surface"
                    )}
                    onClick={() => updateDraft("manual", { categoryName: category.name })}
                    type="button"
                  >
                    <AppIcon className="h-6 w-6" name={category.icon} />
                    <span>{category.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

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
                onChange={(event) => updateDraft("manual", { accountName: event.target.value })}
                value={manualDraft.accountName}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.name}>
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
              onClick={() => setManualDraft(createBlankDraft(categories, accounts))}
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
