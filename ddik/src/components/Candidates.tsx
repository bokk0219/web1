import { useState } from "react";
import { ACTIVE_MALLS } from "../cards";
import { won } from "../calc";
import { unitPrice } from "../parse";
import type { Comparison } from "../types";
import { pickCandidate, rankCandidates } from "./paste";
import { Card } from "./ui";

export default function Candidates({ comparison, onChange }: { comparison: Comparison; onChange: (c: Comparison) => void }) {
  const [open, setOpen] = useState(false);
  const all = comparison.candidates ?? [];
  if (all.length === 0) return null;
  const picked = new Set(comparison.offers.map((o) => o.sourceId));

  return (
    <Card className="space-y-3">
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setOpen(!open)}>
        <h2 className="text-sm text-dk-mute">읽어온 후보 {all.length}개</h2>
        <span className="text-xs text-dk-mute underline">{open ? "접기" : "다른 상품으로 바꾸기"}</span>
      </button>
      {open && ACTIVE_MALLS.map((m) => {
        const list = rankCandidates(all.filter((c) => c.mall === m.key)).slice(0, 8);
        if (list.length === 0) return null;
        return (
          <div key={m.key}>
            <h3 className="text-xs text-dk-mute">{m.name}</h3>
            <ul className="mt-1 divide-y divide-dk-line">
              {list.map((c) => {
                const u = unitPrice(c);
                return (
                  <li key={c.id} className="flex items-center gap-2 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{c.name}</div>
                      <div className="text-xs text-dk-mute">
                        {won(c.price)} · {c.shipping == null ? "배송비 모름" : c.shipping === 0 ? "무료배송" : `배송비 ${won(c.shipping)}${c.shippingGuess ? "(추정)" : ""}`}
                        {u != null && ` · 100ml당 ${won(u)}`}
                        {c.seller && ` · ${c.seller}`}
                      </div>
                    </div>
                    {picked.has(c.id) ? (
                      <span className="shrink-0 text-xs text-dk-accent">선택됨</span>
                    ) : (
                      <button type="button" className="shrink-0 rounded-lg bg-dk-soft px-3 py-1.5 text-xs" onClick={() => onChange(pickCandidate(comparison, c))}>
                        이걸로
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="text-xs text-dk-mute">용량은 상품명에서 추정했어요. 쇼핑몰마다 가장 싼 후보(100ml당)를 자동으로 골랐어요.</p>
    </Card>
  );
}
