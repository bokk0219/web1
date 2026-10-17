import { useState } from "react";
import { mallName } from "../cards";
import { isSupported } from "../storage";
import type { Comparison } from "../types";
import type { MallKey } from "../types";
import BookmarkSetup from "./BookmarkSetup";
import PasteBox from "./PasteBox";
import { Card } from "./ui";

export default function Home({
  recent, onStart, onPaste, onOpen, onDelete,
}: {
  recent: Comparison[];
  onStart: (url: string) => void;
  onPaste: (text: string) => { found: number; mall: MallKey | null };
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [url, setUrl] = useState("");
  const valid = isSupported(url);

  return (
    <div className="space-y-8">
      <header className="pt-6">
        <h1 className="text-3xl">
          띡<span className="text-dk-accent">!</span> 쇼핑
        </h1>
        <p className="mt-2 text-sm text-dk-mute">가격 비교도, 카드 계산도, 띡!</p>
      </header>

      <Card>
        <h2 className="mb-2 text-sm">검색 결과 붙여넣기</h2>
        <PasteBox onPaste={onPaste} label="띡! 비교하기" />
        <p className="mt-2 text-xs leading-relaxed text-dk-mute">
          쇼핑몰마다 한 번씩 붙여넣으면 가장 싼 상품을 골라 카드 혜택까지 비교해요. 네이버 가격비교에는 11번가 가격도 함께 나와요.
        </p>
      </Card>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onStart(url);
          }}
        >
          <label className="text-xs text-dk-mute" htmlFor="url">상품 링크</label>
          <input
            id="url"
            className="mt-1 w-full rounded-xl border border-dk-line px-3 py-3 text-base outline-none focus:border-dk-ink"
            placeholder="네이버·G마켓·11번가 상품 링크"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {url.trim() !== "" && !valid && (
            <p className="mt-2 text-xs text-amber-800">네이버·G마켓·11번가 링크만 비교할 수 있어요.</p>
          )}
          <button
            type="submit"
            disabled={!valid}
            className="mt-3 w-full rounded-xl bg-dk-ink py-3 text-white disabled:opacity-30"
          >
            링크로 비교하기
          </button>
        </form>
        <button type="button" className="mt-3 w-full text-sm text-dk-mute underline" onClick={() => onStart("")}>
          링크 없이 직접 가격 입력
        </button>
      </Card>

      <BookmarkSetup />

      <section>
        <h2 className="text-sm text-dk-mute">최근 비교한 상품</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-dk-mute">아직 비교한 상품이 없어요.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(c.id)}>
                  <div className="truncate">{c.productName || "이름 없는 상품"}</div>
                  <div className="truncate text-xs text-dk-mute">
                    {c.offers.map((o) => mallName(o.mall, o.mallName)).join(" · ")} · {c.updatedAt.slice(0, 10)}
                  </div>
                </button>
                <button
                  type="button"
                  className="shrink-0 text-xs text-dk-mute underline"
                  onClick={() => confirm("이 비교를 삭제할까요?") && onDelete(c.id)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
