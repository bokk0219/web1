import type { Record } from "../types";

export interface IntervalStats {
  count: number;
  intervals: number[]; // days between consecutive records, oldest-pair first
  average: number | null;
  shortest: number | null;
  longest: number | null;
  latest: number | null; // interval between the two most recent records
  daysSinceLast: number | null;
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const dateA = new Date(`${a}T00:00:00`);
  const dateB = new Date(`${b}T00:00:00`);
  return Math.round((dateB.getTime() - dateA.getTime()) / msPerDay);
}

export function computeStats(records: Record[]): IntervalStats {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(daysBetween(sorted[i - 1].date, sorted[i].date));
  }

  const average =
    intervals.length > 0
      ? Math.round((intervals.reduce((s, v) => s + v, 0) / intervals.length) * 10) / 10
      : null;
  const shortest = intervals.length > 0 ? Math.min(...intervals) : null;
  const longest = intervals.length > 0 ? Math.max(...intervals) : null;
  const latest = intervals.length > 0 ? intervals[intervals.length - 1] : null;
  const daysSinceLast =
    sorted.length > 0 ? daysBetween(sorted[sorted.length - 1].date, todayISOLocal()) : null;

  return {
    count: sorted.length,
    intervals,
    average,
    shortest,
    longest,
    latest,
    daysSinceLast,
  };
}

function todayISOLocal(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function daysAgo(dateISO: string): number {
  return daysBetween(dateISO, todayISOLocal());
}

export function relativeLabel(dateISO: string): string {
  const days = daysAgo(dateISO);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}

export function formatDateKorean(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
