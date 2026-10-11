import { useState } from "react";
import { ICON_CATEGORIES } from "../storage";
import ItemIcon from "./ItemIcon";

interface AddItemModalProps {
  onClose: () => void;
  onCreate: (item: {
    name: string;
    emoji: string;
    category: string;
    trackPrice: boolean;
    trackQuantity: boolean;
    reasonOptions: string[];
  }) => void;
}

export default function AddItemModal({ onClose, onCreate }: AddItemModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(ICON_CATEGORIES[0].label);
  const [emoji, setEmoji] = useState(ICON_CATEGORIES[0].emojis[0]);
  const [trackPrice, setTrackPrice] = useState(false);
  const [trackQuantity, setTrackQuantity] = useState(false);
  const [reasonText, setReasonText] = useState("");

  const canSubmit = name.trim().length > 0;
  const currentEmojis = ICON_CATEGORIES.find((c) => c.label === category)?.emojis ?? [];

  function selectCategory(label: string) {
    setCategory(label);
    const emojis = ICON_CATEGORIES.find((c) => c.label === label)?.emojis ?? [];
    if (!emojis.includes(emoji)) {
      setEmoji(emojis[0]);
    }
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const reasonOptions = reasonText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onCreate({ name: name.trim(), emoji, category, trackPrice, trackQuantity, reasonOptions });
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-cream w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-ink">새 항목 만들기</h2>
          <button onClick={onClose} className="text-stone text-sm">닫기</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-espresso font-medium">이름</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 침구 교체"
            className="w-full bg-white/70 border border-beige rounded-xl px-4 py-3 text-ink placeholder:text-stone/60 outline-none focus:border-clay"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-espresso font-medium">분류</label>
          <div className="flex flex-wrap gap-2">
            {ICON_CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => selectCategory(c.label)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  category === c.label ? "bg-clay text-ink" : "bg-white/60 text-ink/80"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-espresso font-medium">아이콘</label>
          <div className="grid grid-cols-7 gap-2">
            {currentEmojis.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex justify-center rounded-lg py-1.5 transition-colors ${
                  emoji === e ? "bg-clay/60" : "bg-white/50 hover:bg-beige"
                }`}
                aria-label={e}
              >
                <ItemIcon emoji={e} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-espresso font-medium">기록할 때 추가로 남길 정보 (선택)</label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={trackPrice} onChange={(e) => setTrackPrice(e.target.checked)} />
            가격
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={trackQuantity} onChange={(e) => setTrackQuantity(e.target.checked)} />
            수량
          </label>
          <div className="space-y-1">
            <label className="text-sm text-ink">이유 선택지 (쉼표로 구분, 예: 냄새, 오염, 계절)</label>
            <input
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="안 적어도 돼요"
              className="w-full bg-white/70 border border-beige rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-stone/60 outline-none focus:border-clay"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-espresso disabled:bg-stone/50 text-cream rounded-full py-3.5 font-medium mt-2"
        >
          항목 만들기
        </button>
      </div>
    </div>
  );
}
