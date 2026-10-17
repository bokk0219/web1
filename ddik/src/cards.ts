import type { MallKey } from "./types";

// 카드 혜택 기준. 약관이 바뀌면 이 파일만 고친다.
// 확인 기준일과 출처를 화면에 함께 보여준다.

// active: 비교 대상으로 쓰는 쇼핑몰. 나머지는 예전 기록 표시용으로만 남겨 둔다.
export const MALLS: { key: MallKey; name: string; hosts: string[]; active?: boolean }[] = [
  { key: "naverplus", name: "네이버플러스 스토어", active: true, hosts: ["smartstore.naver.com", "brand.naver.com", "shopping.naver.com", "search.shopping.naver.com", "naver.me"] },
  { key: "coupang", name: "쿠팡", hosts: ["coupang.com"] },
  { key: "11st", name: "11번가", active: true, hosts: ["11st.co.kr"] },
  { key: "gmarket", name: "G마켓", active: true, hosts: ["gmarket.co.kr"] },
  { key: "auction", name: "옥션", hosts: ["auction.co.kr"] },
  { key: "tmon", name: "티몬", hosts: ["tmon.co.kr"] },
  { key: "wemakeprice", name: "위메프", hosts: ["wemakeprice.com"] },
  { key: "other", name: "기타 쇼핑몰", hosts: [] },
];

export const ACTIVE_MALLS = MALLS.filter((m) => m.active);

export const mallName = (key: MallKey, custom?: string) =>
  key === "other" && custom ? custom : MALLS.find((m) => m.key === key)!.name;

export const DEEP_ECO = {
  name: "신한카드 Deep ECO",
  short: "Deep ECO",
  kind: "cash" as const,
  checkedAt: "2026-10-17",
  source: "신한카드 상품설명서 정리본 (신규 발급 중단 카드)",
  rate: 0.05,
  minPrevMonth: 300_000,
  monthlyCap: 30_000, // 교통·온라인&Recycling·Paperless 통합
  malls: ["coupang", "11st", "gmarket", "auction", "tmon", "wemakeprice"] as MallKey[],
  conditions: [
    "제휴사 홈페이지 직접 접속 또는 앱에서 결제한 경우만 적용",
    "월 한도 3만원은 교통·온라인&Recycling·Paperless 캐시백 합산",
    "가족카드는 실적·한도 합산",
  ],
};

export const EDITION3 = {
  name: "네이버 현대카드 Edition3",
  short: "Edition3",
  kind: "point" as const,
  checkedAt: "2026-10-17",
  source: "2026.8.26 출시 보도자료·정리 기사",
  minPrevMonth: 400_000,
  membership: { rate: 0.05, cap: 15_000 },
  general: { rate: 0.005 },
  nonMember: { rate: 0.005 },
  // 더블 적립 행사: 2026.8.26 ~ 2027.7.31
  double: { until: "2027-07-31", membershipRate: 0.1, membershipCap: 30_000, generalRate: 0.01 },
  // 출시 이벤트: 2026.9.30까지 발급 시 2026.12.31까지 멤버십 대상 적립에 전월실적 면제
  launchExemptUntil: "2026-12-31",
  conditions: [
    "네이버플러스 스토어의 멤버십 적립 대상 상품(적립 아이콘)만 5% 적용",
    "상품권·기프티콘·선불 충전 등 현금성 결제는 적립 제외",
    "무이자 할부·다른 현대카드 할인 적용 결제는 적립 제외",
    "적립은 다음 달 15일, 결제 건별 소수점 반올림",
  ],
};

export const isOn = (until: string, today: string) => today <= until;
