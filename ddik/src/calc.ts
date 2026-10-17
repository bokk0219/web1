import { DEEP_ECO, EDITION3, isOn, mallName } from "./cards";
import type { CardSettings, Offer } from "./types";

export type CardKey = "deepEco" | "edition3";

// expected: 조건이 모두 확인되어 예상 금액으로 계산
// none: 조건상 혜택 없음 (확인됨)
// unknown: 확인되지 않은 조건이 있어 실질 비용에 넣지 않음
export type BenefitStatus = "expected" | "none" | "unknown";

export interface Benefit {
  card: CardKey;
  kind: "cash" | "point";
  amount: number; // 원(캐시백) 또는 P(포인트)
  valueWon: number; // 원화 환산
  status: BenefitStatus;
  potentialWon: number; // unknown일 때 조건 충족 시 예상 금액
  basis: string[]; // 계산 근거
  conditions: string[]; // 혜택 적용 조건
  missing: string[]; // 확인 필요한 항목
}

export interface Row {
  offer: Offer;
  card: CardKey;
  payment: number;
  benefit: Benefit;
  mallPointsWon: number;
  effective: number; // 실질 구매 비용 (확인된 혜택만 반영)
}

export const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
export const pt = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}P`;
const pct = (r: number) => `${+(r * 100).toFixed(2)}%`;

export function paymentOf(o: Offer): number | null {
  if (o.price == null) return null;
  return Math.max(0, o.price + (o.shipping ?? 0) - (o.coupon ?? 0));
}

export function deepEcoBenefit(o: Offer, payment: number, s: CardSettings["deepEco"]): Benefit {
  const b: Benefit = {
    card: "deepEco", kind: "cash", amount: 0, valueWon: 0, status: "none",
    potentialWon: 0, basis: [], conditions: [], missing: [],
  };
  const name = mallName(o.mall, o.mallName);
  if (!DEEP_ECO.malls.includes(o.mall)) {
    b.basis.push(`${name}은(는) 온라인 캐시백 대상 가맹점이 아님 → 0원`);
    return b;
  }
  b.conditions.push(...DEEP_ECO.conditions);
  const raw = Math.floor(payment * DEEP_ECO.rate);
  b.basis.push(`${won(payment)} × ${pct(DEEP_ECO.rate)} = ${won(raw)} (원 단위 내림, 보수적 계산)`);

  if (!s.prevMonthMet) {
    b.basis.push(`전월 실적 ${won(DEEP_ECO.minPrevMonth)} 미충족으로 설정 → 0원`);
    return b;
  }
  b.basis.push(`전월 실적 ${won(DEEP_ECO.minPrevMonth)} 이상 채운다고 가정`);
  const remain = Math.max(0, DEEP_ECO.monthlyCap - (s.usedCashback ?? 0));
  const amount = Math.min(raw, remain);
  b.basis.push(
    s.usedCashback == null
      ? `이번 달 받은 캐시백 미입력 → 월 한도 ${won(DEEP_ECO.monthlyCap)} 전액 남은 것으로 가정`
      : `월 잔여 한도 ${won(remain)} 적용 → ${won(amount)}`,
  );
  b.amount = amount;
  b.valueWon = amount;
  b.status = amount > 0 ? "expected" : "none";
  return b;
}

export function edition3Benefit(
  o: Offer, payment: number, s: CardSettings["edition3"], pointValue: number, today: string,
): Benefit {
  const b: Benefit = {
    card: "edition3", kind: "point", amount: 0, valueWon: 0, status: "none",
    potentialWon: 0, basis: [], conditions: [...EDITION3.conditions], missing: [],
  };
  const double = isOn(EDITION3.double.until, today);
  const isNaver = o.mall === "naverplus";

  let rate: number;
  let cap: number | null = null;
  let exemptOk = false;

  if (isNaver && o.naverMembershipTarget == null) b.missing.push("멤버십 적립 대상 상품 여부");

  if (isNaver && o.naverMembershipTarget !== false && s.naverPlusMember) {
    rate = double ? EDITION3.double.membershipRate : EDITION3.membership.rate;
    cap = double ? EDITION3.double.membershipCap : EDITION3.membership.cap;
    exemptOk = s.launchEventExempt && isOn(EDITION3.launchExemptUntil, today);
    b.basis.push(`멤버십 적립 대상 ${pct(rate)}${double ? " (더블 적립 행사, ~2027.7.31)" : ""}`);
  } else if (isNaver && o.naverMembershipTarget !== false) {
    rate = EDITION3.nonMember.rate;
    b.basis.push(`멤버십 비회원 ${pct(rate)} (더블 적립 적용 여부는 확인되지 않아 기본율로 계산)`);
  } else {
    rate = double ? EDITION3.double.generalRate : EDITION3.general.rate;
    b.basis.push(`국내외 가맹점 ${pct(rate)}${double ? " (더블 적립 행사)" : ""}, 한도 없음`);
  }

  if (exemptOk) b.basis.push("출시 이벤트 대상: 2026.12.31까지 전월 실적 조건 면제");
  else if (!s.prevMonthMet) {
    b.basis.push(`전월 실적 ${won(EDITION3.minPrevMonth)} 미충족으로 설정 → 0P`);
    return b;
  } else b.basis.push(`전월 실적 ${won(EDITION3.minPrevMonth)} 이상 채운다고 가정`);

  const raw = Math.round(payment * rate);
  b.basis.push(`${won(payment)} × ${pct(rate)} = ${pt(raw)} (건별 반올림)`);
  let amount = raw;
  if (cap != null) {
    const remain = Math.max(0, cap - (s.usedMembershipPoints ?? 0));
    amount = Math.min(raw, remain);
    b.basis.push(
      s.usedMembershipPoints == null
        ? `이번 달 적립 포인트 미입력 → 월 한도 ${pt(cap)} 전액 남은 것으로 가정`
        : `월 잔여 한도 ${pt(remain)} 적용 → ${pt(amount)}`,
    );
    if (raw > remain) b.basis.push("한도 초과분의 일반 적립 여부는 확인되지 않아 0P로 계산");
  }
  const valueWon = amount * pointValue;
  if (pointValue !== 1) b.basis.push(`포인트 가치 1P = ${pointValue}원 → ${won(valueWon)}`);
  if (b.missing.length) {
    b.status = "unknown";
    b.potentialWon = valueWon;
    return b;
  }
  b.amount = amount;
  b.valueWon = valueWon;
  b.status = amount > 0 ? "expected" : "none";
  return b;
}

export function buildRows(offers: Offer[], s: CardSettings, today: string): Row[] {
  const rows: Row[] = [];
  for (const o of offers) {
    const payment = paymentOf(o);
    if (payment == null) continue;
    const mallPointsWon = (o.mallPoints ?? 0) * s.pointValue;
    const cards: CardKey[] = [];
    if (s.deepEco.owned) cards.push("deepEco");
    if (s.edition3.owned) cards.push("edition3");
    for (const card of cards) {
      const benefit = card === "deepEco"
        ? deepEcoBenefit(o, payment, s.deepEco)
        : edition3Benefit(o, payment, s.edition3, s.pointValue, today);
      rows.push({ offer: o, card, payment, benefit, mallPointsWon, effective: payment - benefit.valueWon - mallPointsWon });
    }
  }
  // 실질 비용이 같으면 현금 환급(캐시백)을 우선한다.
  return rows.sort((a, b) =>
    a.effective - b.effective || (a.benefit.kind === "cash" ? -1 : 0) - (b.benefit.kind === "cash" ? -1 : 0),
  );
}
