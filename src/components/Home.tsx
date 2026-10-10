import type { Item, Record } from "../types";
import { relativeLabel } from "../utils/stats";

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

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="px-6 pt-10 pb-6 space-y-1">
        <h1 className="text-2xl font-bold text-ink">나는 이렇게 산다</h1>
        <p className="text-stone text-sm">오늘도 뭔가 하나 했다.</p>
      </div>

      <div className="px-6">
        <button
          onClick={onAddRecord}
          className="w-full bg-espresso text-cream rounded-2xl py-4 font-medium shadow-soft flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <span className="text-lg leading-none">＋</span>
          <span>기록하기</span>
        </button>
      </div>

      <div className="px-6 mt-8">
        <h2 className="text-sm font-semibold text-espresso mb-3">최근 기록</h2>
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => {
              const item = itemMap.get(r.itemId);
              if (!item) return null;
              return (
                <li key={r.id}>
                  <button
                    onClick={() => onOpenItem(item.id)}
                    className="w-full flex items-center gap-3 bg-white/60 hover:bg-white/90 transition-colors rounded-xl px-4 py-3 text-left"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="flex-1 text-ink font-medium">{item.name}</span>
                    {r.reason && (
                      <span className="text-xs text-stone/70">{r.reason}</span>
                    )}
                    <span className="text-xs text-stone">{relativeLabel(r.date)}</span>
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

function EmptyState() {
  return (
    <div className="text-center py-16 text-stone text-sm space-y-1">
      <p>아직 기록이 없어요.</p>
      <p>오늘 뭘 했는지 하나 남겨볼까요?</p>
    </div>
  );
}
