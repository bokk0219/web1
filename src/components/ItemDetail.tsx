import type { ReactNode } from "react";
import type { Item, Record } from "../types";
import { computeStats, formatDateKorean, relativeLabel } from "../utils/stats";
import ItemIcon from "./ItemIcon";

interface ItemDetailProps {
  item: Item;
  records: Record[];
  onBack: () => void;
  onAddRecord: () => void;
  onDeleteRecord: (recordId: string) => void;
  onDeleteItem: () => void;
}

export default function ItemDetail({
  item,
  records,
  onBack,
  onAddRecord,
  onDeleteRecord,
  onDeleteItem,
}: ItemDetailProps) {
  const stats = computeStats(records);
  const sortedDesc = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const maxInterval = Math.max(1, ...stats.intervals);

  return (
    <div className="min-h-screen bg-cream pb-28">
      <div className="px-6 pt-10 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="text-stone text-lg">‹</button>
        <h1 className="text-lg font-bold text-ink flex items-center gap-2">
          <ItemIcon emoji={item.emoji} className="h-5 w-5" />
          <span>{item.name}</span>
        </h1>
      </div>

      <div className="px-6">
        <div className="bg-white/60 rounded-2xl p-5 space-y-4">
          <p className="text-ink font-semibold">총 {stats.count}회 기록</p>
          {stats.count === 0 ? (
            <p className="text-sm text-stone">아직 패턴을 발견하기엔 기록이 부족해요. 하나 더 기록해볼까요?</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <StatBox label="평균 간격" value={stats.average !== null ? `${stats.average}일` : "-"} />
              <StatBox label="최근 간격" value={stats.latest !== null ? `${stats.latest}일` : "-"} />
              <StatBox label="가장 짧은 간격" value={stats.shortest !== null ? `${stats.shortest}일` : "-"} />
              <StatBox label="가장 긴 간격" value={stats.longest !== null ? `${stats.longest}일` : "-"} />
            </div>
          )}
          {stats.daysSinceLast !== null && (
            <p className="text-xs text-stone">
              마지막 기록으로부터 {stats.daysSinceLast === 0 ? "오늘" : `${stats.daysSinceLast}일`} 지났어요.
            </p>
          )}
        </div>

        {stats.intervals.length > 1 && (
          <div className="bg-white/60 rounded-2xl p-5 mt-3">
            <p className="text-xs text-stone mb-3">간격 변화</p>
            <div className="flex items-end gap-1.5 h-20">
              {stats.intervals.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-clay rounded-t-sm"
                    style={{ height: `${Math.max(8, (v / maxInterval) * 100)}%` }}
                    title={`${v}일`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onAddRecord}
          className="w-full bg-espresso text-cream rounded-2xl py-3.5 font-medium mt-5"
        >
          ＋ 이 항목 기록하기
        </button>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-espresso mb-3">기록 목록</h2>
          {sortedDesc.length === 0 ? (
            <p className="text-sm text-stone">기록이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {sortedDesc.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 bg-white/50 rounded-xl px-4 py-3"
                >
                  <div className="flex-1">
                    <p className="text-ink text-sm font-medium">{formatDateKorean(r.date)}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {r.reason && <Tag>{r.reason}</Tag>}
                      {r.price !== undefined && <Tag>{r.price.toLocaleString()}원</Tag>}
                      {r.quantity !== undefined && <Tag>{r.quantity}개</Tag>}
                      {r.memo && <span className="text-xs text-stone">{r.memo}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-stone">{relativeLabel(r.date)}</span>
                  <button
                    onClick={() => onDeleteRecord(r.id)}
                    className="text-stone/60 hover:text-stone text-xs px-1"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={onDeleteItem} className="w-full text-center text-xs text-stone/70 mt-10 py-2">
          이 항목 삭제하기
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-sand/60 rounded-xl px-3 py-2.5">
      <p className="text-stone text-xs">{label}</p>
      <p className="text-ink font-semibold">{value}</p>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="text-xs text-espresso bg-beige/70 rounded-full px-2 py-0.5">{children}</span>;
}
