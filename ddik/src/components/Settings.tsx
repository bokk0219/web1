import { DEEP_ECO, EDITION3, isOn } from "../cards";
import { won, pt } from "../calc";
import type { CardSettings } from "../types";
import { today } from "./Results";
import { Card, Check, NumberField, TriToggle } from "./ui";

export default function Settings({
  settings: s, onChange, onBack,
}: { settings: CardSettings; onChange: (s: CardSettings) => void; onBack: () => void }) {
  const de = (p: Partial<CardSettings["deepEco"]>) => onChange({ ...s, deepEco: { ...s.deepEco, ...p } });
  const e3 = (p: Partial<CardSettings["edition3"]>) => onChange({ ...s, edition3: { ...s.edition3, ...p } });
  const double = isOn(EDITION3.double.until, today());
  const e3cap = double ? EDITION3.double.membershipCap : EDITION3.membership.cap;

  return (
    <div className="space-y-6">
      <button type="button" className="pt-4 text-sm text-dk-mute" onClick={onBack}>← 돌아가기</button>
      <h1 className="text-2xl">카드 설정</h1>
      <p className="text-xs leading-relaxed text-dk-mute">
        카드 번호·CVC·비밀번호는 묻지도 저장하지도 않아요. 아래 값은 이 기기 브라우저에만 저장됩니다.
        모르는 값은 비워 두면 해당 혜택을 확정 금액으로 계산하지 않아요.
      </p>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2>{DEEP_ECO.name}</h2>
          <Check label="보유" checked={s.deepEco.owned} onChange={(v) => de({ owned: v })} />
        </div>
        {s.deepEco.owned && (
          <>
            <ul className="list-disc pl-4 text-xs leading-relaxed text-dk-mute">
              <li>쿠팡·11번가·G마켓·옥션·티몬·위메프 5% 캐시백</li>
              <li>전월 실적 {won(DEEP_ECO.minPrevMonth)} 이상, 월 한도 {won(DEEP_ECO.monthlyCap)} (교통·온라인·Paperless 합산)</li>
              {DEEP_ECO.conditions.slice(0, 1).map((c) => <li key={c}>{c}</li>)}
            </ul>
            <NumberField label="전월(1일~말일) 이용 금액" value={s.deepEco.prevMonthSpend} onChange={(v) => de({ prevMonthSpend: v })} />
            <NumberField
              label="이번 달 이미 받은 캐시백"
              value={s.deepEco.usedCashback}
              onChange={(v) => de({ usedCashback: v })}
              hint={s.deepEco.usedCashback != null ? `잔여 한도 ${won(Math.max(0, DEEP_ECO.monthlyCap - s.deepEco.usedCashback))}` : "교통·온라인·Paperless 캐시백 합계"}
            />
            <p className="text-xs text-dk-mute">기준: {DEEP_ECO.source} · 확인 {DEEP_ECO.checkedAt}</p>
          </>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2>{EDITION3.name}</h2>
          <Check label="보유" checked={s.edition3.owned} onChange={(v) => e3({ owned: v })} />
        </div>
        {s.edition3.owned && (
          <>
            <ul className="list-disc pl-4 text-xs leading-relaxed text-dk-mute">
              <li>
                네이버플러스 스토어 멤버십 적립 대상 5%, 월 {pt(EDITION3.membership.cap)}
                {double && ` → 더블 적립 행사 중 10%, 월 ${pt(EDITION3.double.membershipCap)} (~2027.7.31)`}
              </li>
              <li>국내외 가맹점 0.5%{double && " → 행사 중 1%"}, 한도 없음</li>
              <li>전월 실적 {won(EDITION3.minPrevMonth)} 이상</li>
            </ul>
            <NumberField label="전월(1일~말일) 이용 금액" value={s.edition3.prevMonthSpend} onChange={(v) => e3({ prevMonthSpend: v })} />
            <TriToggle label="네이버플러스 멤버십 가입" value={s.edition3.naverPlusMember} onChange={(v) => e3({ naverPlusMember: v })} />
            <NumberField
              label="이번 달 멤버십 대상 적립 포인트"
              value={s.edition3.usedMembershipPoints}
              onChange={(v) => e3({ usedMembershipPoints: v })}
              suffix="P"
              hint={s.edition3.usedMembershipPoints != null ? `잔여 한도 ${pt(Math.max(0, e3cap - s.edition3.usedMembershipPoints))}` : `월 한도 ${pt(e3cap)}`}
            />
            {isOn(EDITION3.launchExemptUntil, today()) && (
              <Check
                label="2026년 9월 30일까지 발급받았어요 (출시 이벤트: 2026년 말까지 멤버십 대상 적립 실적 면제)"
                checked={s.edition3.launchEventExempt}
                onChange={(v) => e3({ launchEventExempt: v })}
              />
            )}
            <p className="text-xs text-dk-mute">기준: {EDITION3.source} · 확인 {EDITION3.checkedAt}</p>
          </>
        )}
      </Card>

      <Card className="space-y-2">
        <NumberField
          label="포인트 가치 (현금 대비)"
          value={Math.round(s.pointValue * 100)}
          onChange={(v) => onChange({ ...s, pointValue: Math.min(100, v ?? 100) / 100 })}
          suffix="%"
          hint="네이버페이 포인트를 현금처럼 다 쓴다면 100%. 덜 쓰게 된다면 낮춰 보세요."
        />
      </Card>
    </div>
  );
}
