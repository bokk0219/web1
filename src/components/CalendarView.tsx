import { useState } from "react";
import type { Item, Record } from "../types";
import { getMonthMatrix, WEEKDAY_LABELS } from "../utils/calendar";
import { todayISO } from "../storage";
import ItemIcon from "./ItemIcon";

interface CalendarViewProps {
  items: Item[];
  records: Record[];
  onOpenItem: (itemId: string) => void;
}

export default function CalendarView({ items, records, onOpenItem }: CalendarViewProps) {
  const today = todayISO();
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [month, setMonth] = useState(Number(today.slice(5, 7)) - 1); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(today);

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const recordsByDate = new Map<string, Record[]>();
  for (const r of records) {
    const list = recordsByDate.get(r.date) ?? [];
    list.push(r);
    recordsByDate.set(r.date, list);
  }

  const cells = getMonthMatrix(year, month);
  const selectedRecords = (recordsByDate.get(selectedDate) ?? []).slice().sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  function goToMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="px-6 pt-10 pb-6">
        <h1 className="text-xl font-bold text-ink">달력으로 보기</h1>
        <p className="text-stone text-sm">날짜별로 뭘 했는지 한눈에.</p>
      </div>

      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => goToMonth(-1)} className="text-stone text-lg px-2">‹</button>
          <p className="text-ink font-semibold">{year}년 {month + 1}월</p>
          <button onClick={() => goToMonth(1)} className="text-stone text-lg px-2">›</button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-stone mb-2">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1.5 text-center">
          {cells.map((cell) => {
            const dayRecords = recordsByDate.get(cell.date) ?? [];
            const isSelected = cell.date === selectedDate;
            const isToday = cell.date === today;
            const dayNumber = Number(cell.date.slice(8, 10));
            return (
              <button
                key={cell.date}
                onClick={() => setSelectedDate(cell.date)}
                className="flex flex-col items-center gap-1 py-1"
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                    isSelected
                      ? "bg-espresso text-cream font-semibold"
                      : isToday
                      ? "bg-clay/50 text-ink font-semibold"
                      : cell.inMonth
                      ? "text-ink"
                      : "text-stone/40"
                  }`}
                >
                  {dayNumber}
                </span>
                <span className="flex gap-0.5 h-1.5">
                  {dayRecords.slice(0, 3).map((r) => (
                    <span key={r.id} className="w-1.5 h-1.5 rounded-full bg-clay" />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 mt-8">
        <h2 className="text-sm font-semibold text-espresso mb-3">
          {Number(selectedDate.slice(5, 7))}월 {Number(selectedDate.slice(8, 10))}일 기록
        </h2>
        {selectedRecords.length === 0 ? (
          <p className="text-sm text-stone">이 날은 기록이 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {selectedRecords.map((r) => {
              const item = itemMap.get(r.itemId);
              if (!item) return null;
              return (
                <li key={r.id}>
                  <button
                    onClick={() => onOpenItem(item.id)}
                    className="w-full flex items-center gap-3 bg-white/60 hover:bg-white/90 transition-colors rounded-xl px-4 py-3 text-left"
                  >
                    <ItemIcon emoji={item.emoji} />
                    <span className="flex-1 text-ink font-medium">{item.name}</span>
                    {r.reason && (
                      <span className="text-xs text-stone bg-beige/70 rounded-full px-2 py-0.5">{r.reason}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
