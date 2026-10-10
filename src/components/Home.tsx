import type { Item, Record } from "../types";
import { daysAgo, relativeLabel } from "../utils/stats";

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

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="px-6 pt-10 pb-6 space-y-1">
        <h1 className="text-2xl font-bold text-ink">나는 이렇게 산다</h1>
        <p className="text-stone text-sm">오늘도 뭔가 하나 했다.</p>
      </div>

      <div className="px-6">
        <button
          onClick={onAddRecord}
          className="w-full bg-espresso text-cream rounded-2xl py-4 font-medium flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <span className="text-lg leading-none">＋</span>
          <span>기록하기</span>
        </button>
      </div>

      <div className="px-6 mt-12">
        <h2 className="text-sm font-semibold text-ink mb-4">최근 기록</h2>
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-7">
            {groups.map((group) => (
              <section key={group.label}>
                <h3 className="text-xs text-stone mb-2">{group.label}</h3>
                <ul className="space-y-1.5">
                  {group.records.map((r) => {
                    const item = itemMap.get(r.itemId);
                    if (!item) return null;
                    return (
                      <li key={r.id}>
                        <button
                          onClick={() => onOpenItem(item.id)}
                          className="w-full flex items-center gap-3 bg-white/60 hover:bg-white/90 transition-colors rounded-xl px-4 py-3 text-left"
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <span className="flex-1 min-w-0 text-ink font-medium leading-snug">{item.name}</span>
                          {r.reason && <span className="max-w-[5.5rem] truncate text-xs text-stone/70">{r.reason}</span>}
                          <span className="w-12 shrink-0 text-right text-xs text-stone tabular-nums">{relativeLabel(r.date)}</span>
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

function EmptyState() {
  return (
    <div className="text-center py-16 text-stone text-sm space-y-1">
      <p>아직 기록이 없어요.</p>
      <p>오늘 뭘 했는지 하나 남겨볼까요?</p>
    </div>
  );
}
