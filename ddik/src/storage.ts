import { ACTIVE_MALLS, MALLS } from "./cards";
import type { CardSettings, Comparison, MallKey, Offer } from "./types";

const SETTINGS_KEY = "ddik.settings.v2";
const COMPARISONS_KEY = "ddik.comparisons.v1";

export const defaultSettings = (): CardSettings => ({
  deepEco: { owned: true, prevMonthMet: true, usedCashback: null },
  edition3: { owned: true, prevMonthMet: true, naverPlusMember: true, usedMembershipPoints: null, launchEventExempt: false },
  pointValue: 1,
});

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장이 막힌 브라우저(사생활 보호 모드 등)에서는 이번 접속 동안만 유지
  }
}

export const loadSettings = (): CardSettings => {
  const d = defaultSettings();
  const s = read<Partial<CardSettings>>(SETTINGS_KEY, {});
  return { ...d, ...s, deepEco: { ...d.deepEco, ...s.deepEco }, edition3: { ...d.edition3, ...s.edition3 } };
};
export const saveSettings = (s: CardSettings) => write(SETTINGS_KEY, s);

export const loadComparisons = (): Comparison[] => read<Comparison[]>(COMPARISONS_KEY, []);
export const saveComparisons = (list: Comparison[]) => write(COMPARISONS_KEY, list.slice(0, 20));

export const uid = () => Math.random().toString(36).slice(2, 10);

export function detectMall(url: string): MallKey | null {
  try {
    const host = new URL(url.trim()).hostname.replace(/^(www|m)\./, "");
    const hit = MALLS.find((m) => m.hosts.some((h) => host === h || host.endsWith("." + h)));
    return hit ? hit.key : "other";
  } catch {
    return null;
  }
}

export const isSupported = (url: string) => {
  const m = detectMall(url);
  return m != null && ACTIVE_MALLS.some((a) => a.key === m);
};

export function newOffer(url = "", fallback: MallKey = "naverplus"): Offer {
  const mall = (url && detectMall(url)) || fallback;
  let mallName = "";
  if (mall === "other" && url) {
    try { mallName = new URL(url).hostname.replace(/^(www|m)\./, ""); } catch { /* 주소가 아니면 비워 둠 */ }
  }
  return {
    id: uid(), mall, mallName, url: url.trim(), price: null, shipping: null, coupon: null, mallPoints: null,
    naverMembershipTarget: true, sameProduct: false, option: "", checkedAt: new Date().toISOString(),
  };
}

export function newComparison(url = ""): Comparison {
  const now = new Date().toISOString();
  return { id: uid(), productName: "", imageUrl: "", offers: [newOffer(url)], createdAt: now, updatedAt: now };
}
