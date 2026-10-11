import type { AppData, Item, Record } from "./types";

const STORAGE_KEY = "life-pattern-tracker:data";

function emptyData(): AppData {
  return { items: [], records: [], hasVisited: false };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw);
    const items: Item[] = Array.isArray(parsed.items) ? parsed.items : [];
    return {
      items: items.map((item) => ({ ...item, category: item.category ?? DEFAULT_CATEGORY })),
      records: Array.isArray(parsed.records) ? parsed.records : [],
      hasVisited: Boolean(parsed.hasVisited),
      pinnedItemId: typeof parsed.pinnedItemId === "string" ? parsed.pinnedItemId : undefined,
    };
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export interface IconCategory {
  label: string;
  emojis: string[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  { label: "위생·미용", emojis: ["🪥", "💇", "✂️", "🪒", "💅", "🚿", "🧴"] },
  { label: "청소·세탁", emojis: ["🧺", "🧹", "🧼", "🧽", "👕", "🧦"] },
  { label: "건강", emojis: ["💊", "🩹", "🌱"] },
  { label: "반려동물", emojis: ["🐾"] },
  { label: "생활용품", emojis: ["🛏️", "🔋", "🕯️"] },
  { label: "기타", emojis: ["📦", "⭐", "🔧"] },
];

export const DEFAULT_CATEGORY = "기타";

export type { Item, Record };
