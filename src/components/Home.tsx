import { useEffect, useState } from "react";
import type { Item, Record } from "../types";
import { computeStats, daysAgo, relativeLabel } from "../utils/stats";
import ItemIcon from "./ItemIcon";

interface HomeProps {
  items: Item[];
  records: Record[];
  onOpenItem: (itemId: string) => void;
  onAddRecord: () => void;
}

export default function Home({ items, records, onOpenItem, onAddRecord }: HomeProps) {
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const recent = [...records]
    .sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)))
    .reverse()
    .slice(0, 30);
  const groups = groupByPeriod(recent);
  const recentNames = [...new Set(recent.map((r) => itemMap.get(r.itemId)?.name).filter(Boolean))].slice(0, 5) as string[];
  const note = findNote(items, records);

  return (
    <div className="min-h-screen bg-paper pb-28">
      <div className="px-6 pt-8 pb-10">
        {note && <StatusNote days={note.days} text={note.text} />}
        <p className="mt-10 text-sm text-mute">2manythings</p>
        <h1 className="mt-1 h-11 overflow-hidden font-serif text-[30px] font-light leading-[44px] text-ink">
          <RotatingWord words={recentNames} fallback="오늘도 하나 했다" />
        </h1>
      </div>

      <div className="px-6">
        <button
          onClick={onAddRecord}
          className="w-full bg-ink text-paper rounded-xl py-4 font-medium flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <span className="text-lg leading-none">＋</span>
          <span>기록하기</span>
        </button>
      </div>

      <div className="px-6 mt-12">
        <h2 className="text-sm font-medium text-ink mb-4">최근 기록</h2>
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-7">
            {groups.map((group) => (
              <section key={group.label}>
                <h3 className="text-xs text-mute mb-2">{group.label}</h3>
                <ul className="space-y-1.5">
                  {group.records.map((r) => {
                    const item = itemMap.get(r.itemId);
                    if (!item) return null;
                    return (
                      <li key={r.id}>
                        <button
                          onClick={() => onOpenItem(item.id)}
                          className="group w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3 text-left"
                        >
                          <span className="transition-transform duration-300 group-active:scale-125 group-active:-rotate-6"><ItemIcon emoji={item.emoji} /></span>
                          <span className="flex-1 min-w-0 text-ink leading-snug">{item.name}</span>
                          {r.reason && <span className="max-w-[5.5rem] truncate text-xs text-mute/80">{r.reason}</span>}
                          <span className="w-12 shrink-0 text-right text-xs text-mute tabular-nums">{relativeLabel(r.date)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const PERIODS = [
  { label: "오늘 · 어제", maxDays: 1 },
  { label: "최근 일주일", maxDays: 6 },
  { label: "그 전", maxDays: Infinity },
];

function groupByPeriod(records: Record[]) {
  return PERIODS.map((period, i) => {
    const minDays = i === 0 ? -Infinity : PERIODS[i - 1].maxDays + 1;
    return {
      label: period.label,
      records: records.filter((r) => {
        const days = daysAgo(r.date);
        return days >= minDays && days <= period.maxDays;
      }),
    };
  }).filter((group) => group.records.length > 0);
}

function RotatingWord({ words, fallback }: { words: string[]; fallback: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(timer);
  }, [words.length]);
  const word = words.length > 0 ? words[index % words.length] : fallback;
  return (
    <span key={word} className="block animate-word-in">
      {word}
    </span>
  );
}

function StatusNote({ days, text }: { days: number; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink">
      <span className="[perspective:200px]">
        <span className="relative block h-[22px] w-5 origin-top animate-page-flip rounded-[3px] border border-ink bg-card">
          <span className="absolute inset-x-0 top-0 h-[5px] bg-ink" />
          <span className="absolute inset-x-0 bottom-0 text-center text-[9px] leading-[15px] tabular-nums">
            {Math.min(days, 99)}
          </span>
        </span>
      </span>
      <span>{text}</span>
    </div>
  );
}

// 평소 간격보다 오래된 항목을 먼저 알려주고, 없으면 가장 오래 쉰 항목을 알려준다
function findNote(items: Item[], records: Record[]) {
  let due: { days: number; text: string; ratio: number } | null = null;
  let oldest: { days: number; text: string } | null = null;
  for (const item of items) {
    const stats = computeStats(records.filter((r) => r.itemId === item.id));
    if (stats.daysSinceLast === null) continue;
    const days = stats.daysSinceLast;
    if (stats.average && days >= stats.average) {
      const ratio = days / stats.average;
      if (!due || ratio > due.ratio) {
        due = { days, ratio, text: `${item.name} 할 때예요 · 평소 ${Math.round(stats.average)}일마다` };
      }
    }
    if (!oldest || days > oldest.days) oldest = { days, text: `${item.name} 한 지 ${days}일째` };
  }
  return due ?? oldest;
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-mute text-sm space-y-1">
      <p>아직 기록이 없어요.</p>
      <p>오늘 뭘 했는지 하나 남겨볼까요?</p>
    </div>
  );
}
