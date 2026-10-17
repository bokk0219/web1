import type { ReactNode } from "react";
import type { TriState } from "../types";

export function NumberField({
  label, value, onChange, suffix = "원", hint,
}: { label: string; value: number | null; onChange: (v: number | null) => void; suffix?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-dk-mute">{label}</span>
      <div className="mt-1 flex items-center rounded-xl border border-dk-line bg-white px-3 focus-within:border-dk-ink">
        <input
          inputMode="numeric"
          className="w-full min-w-0 bg-transparent py-2.5 text-right text-base outline-none"
          placeholder="미입력"
          value={value == null ? "" : value.toLocaleString("ko-KR")}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, "");
            onChange(digits === "" ? null : Number(digits));
          }}
        />
        <span className="ml-1 shrink-0 text-sm text-dk-mute">{suffix}</span>
      </div>
      {hint && <span className="mt-1 block text-xs text-dk-mute">{hint}</span>}
    </label>
  );
}

export function TextField({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-dk-mute">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-dk-line bg-white px-3 py-2.5 text-base outline-none focus:border-dk-ink"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function TriToggle({
  label, value, onChange, yes = "예", no = "아니오",
}: { label: string; value: TriState; onChange: (v: TriState) => void; yes?: string; no?: string }) {
  const opts: { v: TriState; t: string }[] = [{ v: true, t: yes }, { v: false, t: no }, { v: null, t: "모름" }];
  return (
    <div>
      <span className="text-xs text-dk-mute">{label}</span>
      <div className="mt-1 grid grid-cols-3 gap-1 rounded-xl bg-dk-soft p-1">
        {opts.map((o) => (
          <button
            key={o.t}
            type="button"
            onClick={() => onChange(o.v)}
            className={`rounded-lg py-2 text-sm ${value === o.v ? "bg-white text-dk-ink shadow-sm" : "text-dk-mute"}`}
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input type="checkbox" className="mt-0.5 h-4 w-4 accent-dk-accent" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white p-4 ${className}`}>{children}</section>;
}

export function Badge({ tone, children }: { tone: "ok" | "warn" | "none"; children: ReactNode }) {
  const cls = { ok: "bg-dk-accent/10 text-dk-accent", warn: "bg-amber-100 text-amber-800", none: "bg-dk-soft text-dk-mute" }[tone];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}
