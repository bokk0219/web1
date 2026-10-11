import { useState } from "react";
import type { Item } from "../types";
import { todayISO } from "../storage";
import ItemIcon from "./ItemIcon";

interface AddRecordModalProps {
  items: Item[];
  initialItemId?: string;
  onClose: () => void;
  onCreate: (record: {
    itemId: string;
    date: string;
    memo?: string;
    price?: number;
    quantity?: number;
    reason?: string;
  }) => void;
  onRequestNewItem: () => void;
}

export default function AddRecordModal({
  items,
  initialItemId,
  onClose,
  onCreate,
  onRequestNewItem,
}: AddRecordModalProps) {
  const [itemId, setItemId] = useState(initialItemId ?? items[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [memo, setMemo] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const selectedItem = items.find((i) => i.id === itemId);
  const canSubmit = Boolean(itemId && date);

  function handleSubmit() {
    if (!canSubmit) return;
    onCreate({
      itemId,
      date,
      memo: memo.trim() || undefined,
      price: price ? Number(price) : undefined,
      quantity: quantity ? Number(quantity) : undefined,
      reason: reason || undefined,
    });
  }

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-50">
        <div className="bg-cream w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 space-y-4">
          <p className="text-ink">아직 만든 항목이 없어요. 먼저 항목을 만들어주세요.</p>
          <button onClick={onRequestNewItem} className="w-full bg-espresso text-cream rounded-full py-3 font-medium">
            새 항목 만들기
          </button>
          <button onClick={onClose} className="w-full text-stone text-sm py-1">취소</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-cream w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">기록하기</h2>
          <button onClick={onClose} className="text-stone text-sm">닫기</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-espresso font-medium">무엇을 했나요?</label>
          <div className="flex flex-wrap gap-2">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setItemId(it.id)}
                className={`px-3 py-2 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                  itemId === it.id ? "bg-clay text-ink" : "bg-white/60 text-ink/80"
                }`}
              >
                <ItemIcon emoji={it.emoji} size={16} />
                <span>{it.name}</span>
              </button>
            ))}
            <button
              onClick={onRequestNewItem}
              className="px-3 py-2 rounded-full text-sm bg-beige/60 text-espresso"
            >
              + 새 항목
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-espresso font-medium">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/70 border border-beige rounded-xl px-4 py-3 text-ink outline-none focus:border-clay"
          />
        </div>

        {selectedItem?.reasonOptions && selectedItem.reasonOptions.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm text-espresso font-medium">이유 (선택)</label>
            <div className="flex flex-wrap gap-2">
              {selectedItem.reasonOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(reason === r ? "" : r)}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    reason === r ? "bg-clay text-ink" : "bg-white/60 text-ink/80"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedItem?.trackPrice && (
          <div className="space-y-2">
            <label className="text-sm text-espresso font-medium">가격 (선택)</label>
            <input
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="원"
              className="w-full bg-white/70 border border-beige rounded-xl px-4 py-3 text-ink placeholder:text-stone/60 outline-none focus:border-clay"
            />
          </div>
        )}

        {selectedItem?.trackQuantity && (
          <div className="space-y-2">
            <label className="text-sm text-espresso font-medium">수량 (선택)</label>
            <input
              type="number"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-white/70 border border-beige rounded-xl px-4 py-3 text-ink outline-none focus:border-clay"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-espresso font-medium">메모 (선택)</label>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="짧게 남겨보세요"
            className="w-full bg-white/70 border border-beige rounded-xl px-4 py-3 text-ink placeholder:text-stone/60 outline-none focus:border-clay"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-espresso disabled:bg-stone/50 text-cream rounded-full py-3.5 font-medium"
        >
          기록 완료
        </button>
      </div>
    </div>
  );
}
