import type { Item, Record } from "../types";
import { computeStats } from "../utils/stats";
import { ICON_CATEGORIES, DEFAULT_CATEGORY } from "../storage";
import ItemIcon from "./ItemIcon";

interface ItemsListProps {
  items: Item[];
  records: Record[];
  onOpenItem: (itemId: string) => void;
  onAddItem: () => void;
}

const CATEGORY_ORDER = [...ICON_CATEGORIES.map((c) => c.label), DEFAULT_CATEGORY];

export default function ItemsList({ items, records, onOpenItem, onAddItem }: ItemsListProps) {
  const groups = CATEGORY_ORDER.map((label) => ({
    label,
    items: items.filter((i) => (i.category || DEFAULT_CATEGORY) === label),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="px-6 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">나의 항목</h1>
        <button onClick={onAddItem} className="text-sm text-espresso font-medium bg-beige/70 rounded-full px-3 py-1.5">
          + 새 항목
        </button>
      </div>

      <div className="px-6 space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-16 text-stone text-sm space-y-1">
            <p>아직 만든 항목이 없어요.</p>
            <p>기록하고 싶은 생활 습관을 추가해보세요.</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="space-y-2">
              <h2 className="text-xs font-semibold text-stone px-1">{group.label}</h2>
              {group.items.map((item) => {
                const itemRecords = records.filter((r) => r.itemId === item.id);
                const stats = computeStats(itemRecords);
                return (
                  <button
                    key={item.id}
                    onClick={() => onOpenItem(item.id)}
                    className="w-full flex items-center gap-3 bg-white/60 hover:bg-white/90 transition-colors rounded-xl px-4 py-3.5 text-left"
                  >
                    <ItemIcon emoji={item.emoji} />
                    <div className="flex-1">
                      <p className="text-ink font-medium">{item.name}</p>
                      <p className="text-xs text-stone">
                        {stats.count === 0
                          ? "아직 기록 없음"
                          : `총 ${stats.count}회${stats.average !== null ? ` · 평균 ${stats.average}일` : ""}`}
                      </p>
                    </div>
                    <span className="text-stone">›</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
