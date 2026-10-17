import { useState } from "react";
import type { MallKey } from "../types";
import { mallName } from "../cards";

export default function PasteBox({
  onPaste, label = "띡! 읽기",
}: { onPaste: (text: string) => { found: number; mall: MallKey | null }; label?: string }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div>
      <textarea
        className="h-24 w-full rounded-xl border border-dk-line px-3 py-2 text-sm outline-none focus:border-dk-ink"
        placeholder="네이버·G마켓·11번가 검색 결과 화면을 전체 선택 → 복사해서 여기에 붙여넣기"
        value={text}
        onChange={(e) => { setText(e.target.value); setMsg(""); }}
      />
      <button
        type="button"
        disabled={!text.trim()}
        className="mt-2 w-full rounded-xl bg-dk-ink py-3 text-white disabled:opacity-30"
        onClick={() => {
          const r = onPaste(text);
          if (r.found > 0) {
            setText("");
            setMsg(`${r.mall ? mallName(r.mall) : ""} 상품 ${r.found}개를 읽었어요.`);
          } else {
            setMsg(r.mall
              ? `${mallName(r.mall)} 화면은 알아봤지만 상품 가격을 찾지 못했어요. PC에서 전체 선택으로 복사해 보세요.`
              : "어느 쇼핑몰 화면인지 알 수 없어요. 네이버·G마켓·11번가 검색 결과를 붙여넣어 주세요.");
          }
        }}
      >
        {label}
      </button>
      {msg && <p className="mt-2 text-xs text-dk-mute">{msg}</p>}
    </div>
  );
}
