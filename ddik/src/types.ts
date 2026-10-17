// 판매처(쇼핑몰) 구분. 카드 혜택 대상 여부를 판단하는 기준이 된다.
export type MallKey =
  | "coupang"
  | "11st"
  | "gmarket"
  | "auction"
  | "tmon"
  | "wemakeprice"
  | "naverplus"
  | "other";

// 알 수 없음(null)은 "아니오"와 다르다. 확인되지 않은 조건은 추정하지 않는다.
export type TriState = boolean | null;

export interface Offer {
  id: string;
  mall: MallKey;
  mallName: string; // mall이 other일 때 표시 이름
  url: string;
  price: number | null;
  shipping: number | null;
  coupon: number | null; // 쿠폰·즉시할인 합계
  mallPoints: number | null; // 쇼핑몰 자체 적립(멤버십 적립 등), 직접 입력
  naverMembershipTarget: TriState; // 네이버플러스 스토어: 멤버십 적립 대상 상품인지
  sameProduct: boolean; // 동일 상품·옵션 확인
  option: string;
  checkedAt: string; // 가격 확인 시점 (ISO)
}

export interface Comparison {
  id: string;
  productName: string;
  imageUrl: string;
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
}

export interface CardSettings {
  deepEco: {
    owned: boolean;
    prevMonthSpend: number | null; // 전월(1일~말일) 이용 금액
    usedCashback: number | null; // 이번 달 받은 캐시백 (교통·온라인&Recycling·Paperless 합산)
  };
  edition3: {
    owned: boolean;
    prevMonthSpend: number | null;
    naverPlusMember: TriState;
    usedMembershipPoints: number | null; // 이번 달 멤버십 대상 적립 포인트
    launchEventExempt: boolean; // 2026.9.30까지 발급 → 2026년 말까지 실적 면제
  };
  pointValue: number; // 포인트 1P의 원화 가치
}
