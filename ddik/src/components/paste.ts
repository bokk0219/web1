import { parsePasted, unitPrice, type Candidate } from "../parse";
import { newOffer } from "../storage";
import type { Comparison, MallKey, Offer } from "../types";

// 검색어 낱말이 하나도 없는 상품(다른 브랜드 광고 등)은 자동으로 고르지 않는다
const relevant = (c: Candidate, keyword: string) => {
  const words = keyword.split(/\s+/).filter((w) => w.length >= 2 && !/^[\d.]+$/.test(w));
  return words.length === 0 || words.some((w) => c.name.includes(w));
};

// 배송비가 확인된 후보를 먼저, 그다음 100ml당 가격(없으면 총액)이 싼 순서
export const rankCandidates = (list: Candidate[]) =>
  [...list].sort((a, b) => {
    const known = (c: Candidate) => (c.shipping != null && !c.shippingGuess ? 0 : 1);
    const cost = (c: Candidate) => unitPrice(c) ?? c.price + (c.shipping ?? 0);
    return known(a) - known(b) || cost(a) - cost(b);
  });

export function offerFromCandidate(c: Candidate): Offer {
  return {
    ...newOffer(c.url, c.mall),
    mall: c.mall,
    price: c.price,
    shipping: c.shipping,
    shippingGuess: c.shippingGuess,
    naverMembershipTarget: c.mall === "naverplus" ? c.membershipTarget ?? null : null,
    option: [c.name, c.seller && `판매자 ${c.seller}`].filter(Boolean).join(" · "),
    sourceId: c.id,
    volumeMl: c.volumeMl,
  };
}

// 같은 쇼핑몰의 자동 선택을 이 후보로 바꾼다 (직접 입력한 판매처는 건드리지 않음)
export function pickCandidate(cmp: Comparison, c: Candidate): Comparison {
  const offers = cmp.offers.filter((o) => !(o.sourceId && o.mall === c.mall) && !(o.price == null && !o.sourceId));
  return { ...cmp, offers: [...offers, offerFromCandidate(c)] };
}

export function applyPaste(cmp: Comparison, text: string): { cmp: Comparison; found: number; mall: MallKey | null } {
  const r = parsePasted(text);
  if (r.candidates.length === 0) return { cmp, found: 0, mall: r.mall };
  const keyword = cmp.productName || r.keyword;
  const ids = new Set(r.candidates.map((c) => c.id));
  let next: Comparison = {
    ...cmp,
    productName: keyword,
    candidates: [...(cmp.candidates ?? []).filter((c) => !ids.has(c.id)), ...r.candidates],
  };
  // 붙여넣은 글에 들어 있는 쇼핑몰마다 가장 유리한 후보를 하나씩 자동으로 넣는다
  const malls = [...new Set(r.candidates.map((c) => c.mall))];
  for (const m of malls) {
    const best = rankCandidates(next.candidates!.filter((c) => c.mall === m && relevant(c, keyword)))[0];
    if (best) next = pickCandidate(next, best);
  }
  return { cmp: next, found: r.candidates.length, mall: r.mall };
}
