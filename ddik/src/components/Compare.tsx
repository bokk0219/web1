import { useState } from "react";
import { ACTIVE_MALLS, mallName } from "../cards";
import { isSupported, newOffer } from "../storage";
import type { CardSettings, Comparison, MallKey, Offer } from "../types";
import Candidates from "./Candidates";
import { applyPaste } from "./paste";
import PasteBox from "./PasteBox";
import Results from "./Results";
import { Card, Check, NumberField, TextField, TriToggle } from "./ui";

export default function Compare({
  comparison, settings, onChange, onBack, onSettings,
}: {
  comparison: Comparison;
  settings: CardSettings;
  onChange: (c: Comparison) => void;
  onBack: () => void;
  onSettings: () => void;
}) {
  const [addUrl, setAddUrl] = useState("");
  const set = (patch: Partial<Comparison>) => onChange({ ...comparison, ...patch });
  const setOffer = (id: string, patch: Partial<Offer>) =>
    set({ offers: comparison.offers.map((o) => (o.id === id ? { ...o, ...patch, checkedAt: new Date().toISOString() } : o)) });

  return (
    <div className="space-y-6">
      <button type="button" className="pt-4 text-sm text-dk-mute" onClick={onBack}>← 홈</button>

      <Card className="space-y-3">
        <h2 className="text-sm text-dk-mute">상품 정보</h2>
        <div className="flex gap-3">
          {comparison.imageUrl && (
            <img src={comparison.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-dk-soft object-cover" />
          )}
          <div className="min-w-0 flex-1 space-y-3">
            <TextField label="상품명" value={comparison.productName} onChange={(v) => set({ productName: v })} placeholder="예: 다우니 섬유유연제 4L" />
            <TextField label="대표 이미지 주소 (선택)" value={comparison.imageUrl} onChange={(v) => set({ imageUrl: v.trim() })} placeholder="https://…" />
          </div>
        </div>
        <p className="text-xs leading-relaxed text-dk-mute">
          링크로는 판매처만 자동 인식합니다. 쇼핑몰이 외부 웹 앱의 페이지 읽기를 막고 있어 상품명·가격은 쇼핑몰 화면을 보고 직접 입력해 주세요.
        </p>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-sm text-dk-mute">다른 쇼핑몰 검색 결과 붙여넣기</h2>
        <PasteBox
          label="띡! 추가"
          onPaste={(text) => {
            const r = applyPaste(comparison, text);
            if (r.found > 0) onChange(r.cmp);
            return r;
          }}
        />
      </Card>

      <Results comparison={comparison} settings={settings} onSettings={onSettings} />

      <Candidates comparison={comparison} onChange={onChange} />

      <h2 className="pt-2 text-sm text-dk-mute">판매처 정보 (고치려면 여기서)</h2>
      {comparison.offers.map((o, i) => (
        <OfferEditor
          key={o.id}
          index={i}
          offer={o}
          onChange={(p) => setOffer(o.id, p)}
          onRemove={comparison.offers.length > 1 ? () => set({ offers: comparison.offers.filter((x) => x.id !== o.id) }) : undefined}
        />
      ))}

      <Card className="space-y-2">
        <h2 className="text-sm text-dk-mute">판매처 추가</h2>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-dk-line px-3 py-2.5 text-base outline-none focus:border-dk-ink"
            placeholder="다른 판매처 링크 (비워도 됨)"
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
          />
          <button
            type="button"
            className="shrink-0 rounded-xl bg-dk-ink px-4 text-white disabled:opacity-30"
            disabled={addUrl !== "" && !isSupported(addUrl)}
            onClick={() => {
              // 링크가 없으면 아직 안 넣은 쇼핑몰을 골라 둔다
              const unused = ACTIVE_MALLS.find((m) => !comparison.offers.some((o) => o.mall === m.key));
              set({ offers: [...comparison.offers, newOffer(addUrl, unused?.key)] });
              setAddUrl("");
            }}
          >
            추가
          </button>
        </div>
      </Card>

    </div>
  );
}

function OfferEditor({
  index, offer: o, onChange, onRemove,
}: { index: number; offer: Offer; onChange: (p: Partial<Offer>) => void; onRemove?: () => void }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-dk-mute">판매처 {index + 1}</h2>
        {onRemove && (
          <button type="button" className="text-xs text-dk-mute underline" onClick={onRemove}>삭제</button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-dk-mute">쇼핑몰</span>
          <select
            className="mt-1 w-full rounded-xl border border-dk-line bg-white px-3 py-2.5 text-base outline-none"
            value={o.mall}
            onChange={(e) => onChange({ mall: e.target.value as MallKey })}
          >
            {ACTIVE_MALLS.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
            {!ACTIVE_MALLS.some((m) => m.key === o.mall) && <option value={o.mall}>{mallName(o.mall, o.mallName)}</option>}
          </select>
        </label>
        {o.mall === "other" ? (
          <TextField label="쇼핑몰 이름" value={o.mallName} onChange={(v) => onChange({ mallName: v })} />
        ) : <div />}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="상품 가격" value={o.price} onChange={(v) => onChange({ price: v })} />
        <NumberField label="배송비" value={o.shipping} onChange={(v) => onChange({ shipping: v })} />
        <NumberField label="쿠폰·즉시 할인" value={o.coupon} onChange={(v) => onChange({ coupon: v })} />
        <NumberField label="쇼핑몰 자체 적립" value={o.mallPoints} onChange={(v) => onChange({ mallPoints: v })} suffix="P" />
      </div>

      {o.mall === "naverplus" && (
        <TriToggle
          label="멤버십 적립 대상 상품인가요? (상품 페이지의 적립 아이콘)"
          value={o.naverMembershipTarget}
          onChange={(v) => onChange({ naverMembershipTarget: v })}
        />
      )}

      <TextField label="옵션 (선택)" value={o.option} onChange={(v) => onChange({ option: v })} placeholder="예: 4L × 2개" />
      <Check label="다른 판매처와 같은 상품·옵션인지 확인했어요" checked={o.sameProduct} onChange={(v) => onChange({ sameProduct: v })} />
      {o.url && (
        <a href={o.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-dk-mute underline">
          {o.url}
        </a>
      )}
      <p className="text-xs text-dk-mute">마지막 입력: {new Date(o.checkedAt).toLocaleString("ko-KR")}</p>
    </Card>
  );
}
