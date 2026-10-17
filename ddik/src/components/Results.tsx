import { useState } from "react";
import { DEEP_ECO, EDITION3, mallName } from "../cards";
import { buildRows, pt, won, type Row } from "../calc";
import type { CardSettings, Comparison } from "../types";
import { Badge, Card } from "./ui";

const CARD = { deepEco: DEEP_ECO, edition3: EDITION3 };

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const label = (r: Row) => `${mallName(r.offer.mall, r.offer.mallName)} + ${CARD[r.card].short}`;
const benefitText = (r: Row) =>
  r.benefit.kind === "cash" ? `캐시백 ${won(r.benefit.amount)}` : `포인트 ${pt(r.benefit.amount)}`;

export default function Results({
  comparison, settings, onSettings,
}: { comparison: Comparison; settings: CardSettings; onSettings: () => void }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  if (!settings.deepEco.owned && !settings.edition3.owned) {
    return <Card><p className="text-sm">카드 설정에서 보유 카드를 하나 이상 켜 주세요.</p></Card>;
  }
  const rows = buildRows(comparison.offers, settings, today());
  if (rows.length === 0) {
    return <Card><p className="text-sm text-dk-mute">상품 가격을 입력하면 비교 결과가 나타납니다.</p></Card>;
  }

  const best = rows[0];
  const second = rows.find((r) => r !== best && r.effective > best.effective) ?? rows[1];
  const unknowns = rows.filter((r) => r.benefit.status === "unknown");
  const notSame = comparison.offers.length > 1 && comparison.offers.some((o) => o.price != null && !o.sameProduct);

  const copy = async () => {
    const lines = [
      `[띡! 쇼핑] ${comparison.productName || "상품"}`,
      `추천: ${label(best)}`,
      `결제 ${won(best.payment)} / ${best.benefit.status === "expected" ? `예상 ${benefitText(best)}` : "카드 혜택 없음"} / 실질 ${won(best.effective)}`,
      ...rows.slice(1).map((r) => `- ${label(r)}: 실질 ${won(r.effective)}`),
      `카드 혜택 기준일 ${DEEP_ECO.checkedAt} · 예상 금액이며 확정 아님`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert(lines.join("\n"));
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dk-accent">
        <div className="text-xs text-dk-accent">띡! 추천</div>
        <div className="mt-1 text-xl">{label(best)}</div>
        <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
          <dt className="text-dk-mute">결제 예정 금액</dt><dd className="text-right">{won(best.payment)}</dd>
          <dt className="text-dk-mute">예상 카드 혜택</dt>
          <dd className="text-right">
            {best.benefit.status === "expected" ? benefitText(best)
              : best.benefit.status === "unknown" ? `확인 필요 (최대 ${won(best.benefit.potentialWon)})` : "없음"}
          </dd>
          {best.mallPointsWon > 0 && (<><dt className="text-dk-mute">쇼핑몰 자체 적립</dt><dd className="text-right">{pt(best.offer.mallPoints ?? 0)}</dd></>)}
          <dt className="text-dk-mute">실질 구매 비용</dt><dd className="text-right text-lg">{won(best.effective)}</dd>
        </dl>
        {second && (
          <p className="mt-3 text-sm">
            차선책 <b className="font-normal underline">{label(second)}</b>보다{" "}
            {second.effective - best.effective > 0 ? `${won(second.effective - best.effective)} 유리` : "차이 없음"}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="rounded-xl bg-dk-soft py-2.5 text-sm" onClick={copy}>
            {copied ? "복사됨" : "결과 복사"}
          </button>
          {best.offer.url ? (
            <a className="rounded-xl bg-dk-ink py-2.5 text-center text-sm text-white" href={best.offer.url} target="_blank" rel="noopener noreferrer">
              쇼핑몰로 이동
            </a>
          ) : (
            <span className="rounded-xl bg-dk-soft py-2.5 text-center text-sm text-dk-mute">링크 없음</span>
          )}
        </div>
      </Card>

      {(unknowns.length > 0 || notSame) && (
        <Card className="space-y-2 bg-amber-50">
          {notSame && <p className="text-sm">⚠︎ 동일 상품·옵션 확인이 안 된 판매처가 있어요.</p>}
          {unknowns.length > 0 && (
            <>
              <p className="text-sm">
                ⚠︎ 확인되지 않은 조건이 있어 일부 혜택을 실질 비용에서 뺐어요:{" "}
                {[...new Set(unknowns.flatMap((r) => r.benefit.missing))].join(", ")}
              </p>
              <button type="button" className="text-sm underline" onClick={onSettings}>카드 설정에서 입력하기</button>
            </>
          )}
        </Card>
      )}

      <section>
        <h2 className="text-sm text-dk-mute">전체 비교 (실질 비용 낮은 순)</h2>
        <ul className="mt-3 space-y-2">
          {rows.map((r) => {
            const key = r.offer.id + r.card;
            return (
              <li key={key} className="rounded-2xl bg-white p-4">
                <button type="button" className="w-full text-left" onClick={() => setOpen(open === key ? null : key)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate">{label(r)}</div>
                      <div className="mt-1 text-xs text-dk-mute">
                        결제 {won(r.payment)} ·{" "}
                        {r.benefit.status === "expected" && <>예상 {benefitText(r)}</>}
                        {r.benefit.status === "none" && <>카드 혜택 없음</>}
                        {r.benefit.status === "unknown" && <>조건 확인 시 최대 {won(r.benefit.potentialWon)}</>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div>{won(r.effective)}</div>
                      <div className="mt-1">
                        {r === best ? <Badge tone="ok">추천</Badge>
                          : r.benefit.status === "unknown" ? <Badge tone="warn">확인 필요</Badge>
                          : <Badge tone="none">+{won(r.effective - best.effective)}</Badge>}
                      </div>
                    </div>
                  </div>
                </button>
                {open === key && <Detail r={r} />}
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-dk-mute">
        실질 구매 비용 = 결제 금액 − 예상 캐시백 − 예상 포인트 가치(1P={settings.pointValue}원). 확인되지 않은 혜택은 빼고 계산.
        모든 혜택은 결제 전 예상 금액이며, 실제 지급액은 카드사 확정 내역으로 확인하세요.
        카드 혜택 기준일 {DEEP_ECO.checkedAt}.
      </p>
    </div>
  );
}

function Detail({ r }: { r: Row }) {
  const c = CARD[r.card];
  const o = r.offer;
  return (
    <div className="mt-3 space-y-3 border-t border-dk-line pt-3 text-xs leading-relaxed">
      <div>
        <div className="text-dk-mute">결제 금액</div>
        <div>
          가격 {won(o.price ?? 0)} + 배송비 {won(o.shipping ?? 0)} − 쿠폰 {won(o.coupon ?? 0)} = {won(r.payment)}
        </div>
      </div>
      <div>
        <div className="text-dk-mute">{c.name} 계산 근거</div>
        <ul className="list-disc pl-4">{r.benefit.basis.map((b) => <li key={b}>{b}</li>)}</ul>
        {r.benefit.missing.length > 0 && (
          <p className="mt-1 text-amber-800">확인 필요: {r.benefit.missing.join(", ")}</p>
        )}
      </div>
      {r.benefit.conditions.length > 0 && (
        <div>
          <div className="text-dk-mute">적용 조건</div>
          <ul className="list-disc pl-4">{r.benefit.conditions.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      )}
      {r.mallPointsWon > 0 && <div>쇼핑몰 자체 적립 {pt(o.mallPoints ?? 0)} 반영 (직접 입력값)</div>}
      <div className="text-dk-mute">출처: {c.source} · 확인 {c.checkedAt}</div>
    </div>
  );
}
