import { useEffect, useState } from "react";
import type { Item, Record } from "../types";
import { computeStats, daysAgo, relativeLabel } from "../utils/stats";
import ItemIcon from "./ItemIcon";

interface HomeProps {
  items: Item[];
  records: Record[];
  pinnedItemId?: string;
  onPinItem: (itemId: string | undefined) => void;
  onOpenItem: (itemId: string) => void;
  onAddRecord: () => void;
}

export default function Home({ items, records, pinnedItemId, onPinItem, onOpenItem, onAddRecord }: HomeProps) {
  const [showPinPicker, setShowPinPicker] = useState(false);
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const recent = [...records]
    .sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)))
    .reverse()
    .slice(0, 30);
  const groups = groupByPeriod(recent);
  const recentNames = [...new Set(recent.map((r) => itemMap.get(r.itemId)?.name).filter(Boolean))].slice(0, 5) as string[];
  const pinnedItem = items.find((i) => i.id === pinnedItemId);
  const note = pinnedItem ? pinnedNote(pinnedItem, records) : findNote(items, records);

  return (
    <div className="min-h-screen bg-paper pb-28">
      <div className="px-6 pt-8 pb-6">
        {items.length > 0 && (
          <button onClick={() => setShowPinPicker(true)} className="text-left" aria-label="맨 위 알림 바꾸기">
            <StatusNote days={note?.days ?? 0} text={note?.text ?? "잊으면 안 되는 일을 골라주세요"} pinned={Boolean(pinnedItem)} />
          </button>
        )}
        <p className="mt-14 text-sm text-mute">2manythings</p>
        <h1 className="mt-1 h-11 overflow-hidden text-[30px] leading-[44px] text-ink">
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

      <div className="px-6 mt-14">
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

      {showPinPicker && (
        <PinPicker
          items={items}
          pinnedItemId={pinnedItem?.id}
          onPick={(itemId) => {
            onPinItem(itemId);
            setShowPinPicker(false);
          }}
          onClose={() => setShowPinPicker(false)}
        />
      )}
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

function StatusNote({ days, text, pinned }: { days: number; text: string; pinned: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-ink">
      <span className="[perspective:200px]">
        <span className="relative block h-[26px] w-6 origin-top animate-page-flip rounded-[3px] border border-ink bg-card">
          <span className="absolute inset-x-0 top-0 h-[5px] bg-ink" />
          <span className="absolute inset-x-0 bottom-0 text-center text-[10px] leading-[19px] tabular-nums">
            {Math.min(days, 99)}
          </span>
        </span>
      </span>
      <span>{text}</span>
      <span className="text-mute">{pinned ? "· 고정 ›" : "›"}</span>
    </div>
  );
}

function PinPicker({
  items,
  pinnedItemId,
  onPick,
  onClose,
}: {
  items: Item[];
  pinnedItemId?: string;
  onPick: (itemId: string | undefined) => void;
  onClose: () => void;
}) {
  const option = "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left";
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-paper w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-ink">맨 위에 올릴 항목</h2>
          <button onClick={onClose} className="text-mute text-sm">닫기</button>
        </div>
        <ul className="space-y-1.5">
          <li>
            <button onClick={() => onPick(undefined)} className={`${option} ${pinnedItemId ? "bg-card" : "bg-ink text-paper"}`}>
              <span className="flex-1">자동으로 골라주기</span>
              <span className={`text-xs ${pinnedItemId ? "text-mute" : "text-paper/70"}`}>늦어진 일을 알려줘요</span>
            </button>
          </li>
          {items.map((item) => {
            const selected = item.id === pinnedItemId;
            return (
              <li key={item.id}>
                <button onClick={() => onPick(item.id)} className={`${option} ${selected ? "bg-ink text-paper" : "bg-card text-ink"}`}>
                  <ItemIcon emoji={item.emoji} className={selected ? "text-paper" : ""} />
                  <span className="flex-1">{item.name}</span>
                  {selected && <span className="text-xs text-paper/70">고정됨</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function pinnedNote(item: Item, records: Record[]) {
  const stats = computeStats(records.filter((r) => r.itemId === item.id));
  if (stats.daysSinceLast === null) return { days: 0, text: `${item.name} · 아직 기록이 없어요` };
  const days = stats.daysSinceLast;
  if (stats.average && days >= stats.average) {
    return { days, text: `${item.name} 할 때예요 · 평소 ${Math.round(stats.average)}일마다` };
  }
  return { days, text: `${item.name} 한 지 ${days}일째` };
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
