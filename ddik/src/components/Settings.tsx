import { DEEP_ECO, EDITION3, isOn } from "../cards";
import { pt, won } from "../calc";
import type { CardSettings } from "../types";
import { today } from "./Results";
import { Card, Check, NumberField } from "./ui";

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
        한 번만 정해 두면 됩니다. 매달 입력할 건 없어요. 카드 번호·CVC·비밀번호는 받지 않으며, 설정은 이 기기 브라우저에만 저장됩니다.
      </p>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2>{DEEP_ECO.name}</h2>
          <Check label="보유" checked={s.deepEco.owned} onChange={(v) => de({ owned: v })} />
        </div>
        {s.deepEco.owned && (
          <>
            <p className="text-xs leading-relaxed text-dk-mute">
              G마켓·11번가 5% 캐시백 (제휴사 홈페이지·앱에서 직접 결제 시). 월 한도 {won(DEEP_ECO.monthlyCap)}은 교통·온라인·Paperless 합산.
            </p>
            <Check
              label={`전월 실적 ${won(DEEP_ECO.minPrevMonth)} 이상을 매달 채워요`}
              checked={s.deepEco.prevMonthMet}
              onChange={(v) => de({ prevMonthMet: v })}
            />
            <details className="text-sm">
              <summary className="cursor-pointer text-xs text-dk-mute">한도가 걱정될 때만 (선택)</summary>
              <div className="mt-2">
                <NumberField
                  label="이번 달 이미 받은 캐시백"
                  value={s.deepEco.usedCashback}
                  onChange={(v) => de({ usedCashback: v })}
                  hint="비워 두면 한도가 다 남은 것으로 계산해요."
                />
              </div>
            </details>
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
            <p className="text-xs leading-relaxed text-dk-mute">
              네이버플러스 스토어 멤버십 적립 대상 5%, 월 {pt(EDITION3.membership.cap)}
              {double && ` → 행사 중 10%, 월 ${pt(EDITION3.double.membershipCap)} (~2027.7.31)`}.
              그 외 가맹점 0.5%{double && " (행사 중 1%)"}.
            </p>
            <Check
              label={`전월 실적 ${won(EDITION3.minPrevMonth)} 이상을 매달 채워요`}
              checked={s.edition3.prevMonthMet}
              onChange={(v) => e3({ prevMonthMet: v })}
            />
            <Check label="네이버플러스 멤버십 회원이에요" checked={s.edition3.naverPlusMember} onChange={(v) => e3({ naverPlusMember: v })} />
            {isOn(EDITION3.launchExemptUntil, today()) && (
              <Check
                label="2026년 9월 30일까지 발급받았어요 (2026년 말까지 멤버십 대상 적립 실적 면제)"
                checked={s.edition3.launchEventExempt}
                onChange={(v) => e3({ launchEventExempt: v })}
              />
            )}
            <details className="text-sm">
              <summary className="cursor-pointer text-xs text-dk-mute">한도가 걱정될 때만 (선택)</summary>
              <div className="mt-2">
                <NumberField
                  label="이번 달 멤버십 대상 적립 포인트"
                  value={s.edition3.usedMembershipPoints}
                  onChange={(v) => e3({ usedMembershipPoints: v })}
                  suffix="P"
                  hint={`비워 두면 월 한도 ${pt(e3cap)}가 다 남은 것으로 계산해요.`}
                />
              </div>
            </details>
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
          hint="네이버페이 포인트를 현금처럼 다 쓴다면 100%."
        />
      </Card>
    </div>
  );
}
