export interface CalendarCell {
  date: string; // YYYY-MM-DD
  inMonth: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function getMonthMatrix(year: number, month: number): CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({ date: toISO(prevYear, prevMonth, day), inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: toISO(year, month, day), inMonth: true });
  }

  let nextDay = 1;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  while (cells.length < 42) {
    cells.push({ date: toISO(nextYear, nextMonth, nextDay), inMonth: false });
    nextDay++;
  }

  return cells;
}

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
