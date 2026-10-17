import type { MallKey } from "./types";

// 쇼핑몰 검색 결과 화면을 복사해 붙여넣은 글에서 상품 후보를 뽑는다.
// 쇼핑몰이 화면을 바꾸면 깨질 수 있으므로 읽은 값은 항상 사용자가 고를 수 있는 후보로만 쓴다.

export interface Candidate {
  id: string; // 쇼핑몰 상품 번호
  mall: MallKey;
  name: string;
  price: number;
  shipping: number | null; // null = 화면에서 확인 못 함
  shippingGuess?: boolean; // 가격비교 묶음의 배송비를 최저가 판매처 것으로 추정했을 때
  membershipTarget?: boolean | null; // 네이버플러스 멤버십 적립 대상 표시
  seller: string;
  url: string;
  volumeMl: number | null; // 상품명에서 추정한 총 용량
}

export interface ParseResult {
  mall: MallKey | null;
  keyword: string;
  candidates: Candidate[];
}

const num = (s: string) => Number(s.replace(/,/g, ""));

// "1.8L 2개 + 공병 250ml 2개" → 3600. 공병(빈 용기)은 뺀다. 못 읽으면 null.
export function estimateVolumeMl(name: string): number | null {
  let total = 0;
  for (const seg of name.split("+")) {
    if (seg.includes("공병")) continue;
    const vol = /(\d+(?:\.\d+)?)\s*(ml|l)(?![a-z])/i.exec(seg);
    if (!vol) continue;
    const ml = num(vol[1]) * (vol[2].toLowerCase() === "l" ? 1000 : 1);
    const rest = seg.slice(vol.index + vol[0].length);
    const mult = /[x×]\s*(\d+)|(\d+)\s*개/i.exec(rest);
    total += ml * (mult ? num(mult[1] ?? mult[2]) : 1);
  }
  return total > 0 ? Math.round(total) : null;
}

function parseGmarket(text: string): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  // 상품 하나는 "상품명…" 으로 시작해서 다음 "상품명" 앞에서 끝난다
  const blocks = text.split(/(?=상품명)/).slice(1);
  for (const b of blocks) {
    const name = /^상품명([^\]\n]+)/.exec(b)?.[1].trim();
    const price = /판매가\s*([\d,]+)\s*원/.exec(b);
    if (!name || !price) continue;
    const code = /goodscode=(\d+)/.exec(b)?.[1] ?? name;
    if (seen.has(code)) continue;
    seen.add(code);
    const ship = /배송비\s*([\d,]+)\s*원/.exec(b);
    out.push({
      id: code,
      mall: "gmarket",
      name,
      price: num(price[1]),
      shipping: ship ? num(ship[1]) : /무료배송/.test(b) ? 0 : null,
      seller: /판매자([^\]\n]*)/.exec(b)?.[1].trim() ?? "",
      url: /^\d+$/.test(code) ? `https://item.gmarket.co.kr/Item?goodscode=${code}` : "",
      volumeMl: estimateVolumeMl(name),
    });
  }
  return out;
}

// 네이버 가격비교 검색 결과. 상품 하나는 "[찜하기N](…)" 로 시작한다.
// 가격비교 묶음은 판매처별 가격 목록이 있고, 단독 상품은 가격·배송비가 바로 붙어 있다.
const NAVER_SKIP = /^(판매처|브랜드 카탈로그|전체보기|상품만 보기|정보 수정요청|쿠팡 특가|별점|리뷰|신고하기|\d+개$)/;

function parseNaver(text: string): Candidate[] {
  const out: Candidate[] = [];
  const blocks = text.split(/\[찜하기\d*\]/).slice(1);
  blocks.forEach((b, bi) => {
    const links = [...b.matchAll(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g)];
    const title = links.find((l) => !NAVER_SKIP.test(l[1]) && !/^(용량|피부타입|\[)/.test(l[1]) && l[1].length > 6);
    if (!title) return;
    const name = title[1].trim();
    const volumeMl = estimateVolumeMl(name);
    const lowest = /최저\s*([\d,]+)\s*원/.exec(b);

    if (lowest) {
      const catalog = /https:\/\/search\.shopping\.naver\.com\/catalog\/\d+/.exec(b)?.[0] ?? "";
      const ship = /배송비\s*([\d,]+)\s*원/.exec(b);
      for (const m of b.matchAll(/\* \[(.+?)(\d{1,3}(?:,\d{3})+)\]\(/g)) {
        let seller = m[1].trim();
        const member = seller.endsWith("네이버플러스멤버십");
        if (member) seller = seller.replace(/네이버플러스멤버십$/, "").trim();
        const mall: MallKey | null =
          member ? "naverplus" : seller === "11번가" ? "11st" : /^(G마켓|지마켓)$/.test(seller) ? "gmarket" : null;
        if (!mall) continue; // 쿠팡·기타 쇼핑몰은 비교 대상 아님
        const price = num(m[2]);
        const isLowest = price === num(lowest[1]);
        out.push({
          id: `n${bi}-${seller}`, mall, name, price, seller, url: catalog, volumeMl,
          shipping: isLowest && ship ? num(ship[1]) : /배송비무료/.test(b) && isLowest ? 0 : null,
          shippingGuess: isLowest && !!ship,
          membershipTarget: mall === "naverplus" ? true : undefined,
        });
      }
      return;
    }

    if (/쿠팡/.test(b)) return; // 쿠팡 광고 상품
    const price =
      /([\d,]+)\s*원\s*쿠폰할인가/.exec(b) ?? /할인율\d+%\s*([\d,]+)\s*원/.exec(b) ?? /광고\s*([\d,]+)\s*원/.exec(b);
    if (!price) return;
    const ship = /배송비\s*([\d,]+)\s*원/.exec(b);
    out.push({
      id: `n${bi}`, mall: "naverplus", name, price: num(price[1]), volumeMl,
      shipping: ship ? num(ship[1]) : /배송비\s*무료/.test(b) ? 0 : null,
      seller: /\[([^\]\n]+)\]\(https?:\/\/[^)]+\)\[상품만 보기\]/.exec(b)?.[1] ?? "",
      url: title[2],
      membershipTarget: /네이버플러스멤버십/.test(b) ? true : null,
    });
  });
  return out;
}

// 11번가 검색 결과. 상품마다 "상품명 / 이름 / 가격정보 / … / 스토어명" 줄이 이어진다.
function parse11st(text: string): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  const re = /(?:^|\n)상품명\n([^\n]+)\n가격정보\n/g;
  const starts = [...text.matchAll(re)];
  starts.forEach((m, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index! : text.length;
    const b = text.slice(m.index!, end);
    const priceArea = b.split(/판매자평점|프로모션 정보|스토어명/)[0].replace(/~~[^~]*~~/g, "");
    const price = /([\d,]+)원(~?)/.exec(priceArea);
    if (!price || price[2]) return; // "7,500원~" 처럼 옵션에 따라 달라지는 가격은 뺀다
    const before = text.slice(Math.max(0, m.index! - 4000), m.index!);
    const ids = [...before.matchAll(/products(?:\/|%2F)(\d+)/g)];
    const id = ids.length ? ids[ids.length - 1][1] : m[1];
    if (seen.has(id)) return;
    seen.add(id);
    const ship = /배송비\s*([\d,]+)\s*원/.exec(b);
    out.push({
      id, mall: "11st", name: m[1].trim(), price: num(price[1]),
      shipping: ship ? num(ship[1]) : /배송비\s*무료/.test(b) ? 0 : null,
      seller: /스토어명\n\[([^\]]+)\]/.exec(b)?.[1] ?? "",
      url: /^\d+$/.test(id) ? `https://www.11st.co.kr/products/${id}` : "",
      volumeMl: estimateVolumeMl(m[1]),
    });
  });
  return out;
}

// 다른 쇼핑몰 이름은 본문에도 나오므로(네이버 가격비교의 "11번가" 등) 주소로 먼저 판단한다
export function detectPastedMall(text: string): MallKey | null {
  if (/search\.shopping\.naver\.com/.test(text)) return "naverplus";
  if (/gmarket\.co\.kr/.test(text)) return "gmarket";
  if (/11st\.co\.kr/.test(text)) return "11st";
  if (/G마켓|지마켓/.test(text)) return "gmarket";
  if (/11번가/.test(text)) return "11st";
  if (/네이버/.test(text)) return "naverplus";
  return null;
}

export function parsePasted(text: string): ParseResult {
  const mall = detectPastedMall(text);
  const kw = /[?&](?:keyword|query|kwd)=([^&)\s#]+)/.exec(text)?.[1];
  let keyword = "";
  try {
    // 11번가 주소는 두 번 인코딩돼 있다
    keyword = kw ? decodeURIComponent(kw.replace(/\+/g, " ")) : "";
    if (/%[0-9A-F]{2}/i.test(keyword)) keyword = decodeURIComponent(keyword);
  } catch { /* 깨진 주소는 무시 */ }
  const candidates = mall === "gmarket" ? parseGmarket(text) : mall === "naverplus" ? parseNaver(text) : mall === "11st" ? parse11st(text) : [];
  return { mall, keyword, candidates };
}

export const unitPrice = (c: { price: number; shipping: number | null; volumeMl: number | null }) =>
  c.volumeMl ? ((c.price + (c.shipping ?? 0)) / c.volumeMl) * 100 : null;
