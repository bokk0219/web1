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
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      records: Array.isArray(parsed.records) ? parsed.records : [],
      hasVisited: Boolean(parsed.hasVisited),
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

export const PRESET_EMOJIS = [
  "🪥", "💅", "🛏️", "🧴", "💇", "🧺", "🧼", "🐾", "✂️", "🧽",
  "🚿", "🩹", "💊", "🧦", "👕", "🪒", "🕯️", "🧹", "🔋", "🌱",
];

export type { Item, Record };
