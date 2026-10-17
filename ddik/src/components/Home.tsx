import { useState } from "react";
import { mallName } from "../cards";
import { detectMall } from "../storage";
import type { Comparison } from "../types";
import { Card } from "./ui";

export default function Home({
  recent, onStart, onOpen, onDelete,
}: {
  recent: Comparison[];
  onStart: (url: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [url, setUrl] = useState("");
  const valid = detectMall(url) != null;

  return (
    <div className="space-y-8">
      <header className="pt-6">
        <h1 className="text-3xl">
          띡<span className="text-dk-accent">!</span> 쇼핑
        </h1>
        <p className="mt-2 text-sm text-dk-mute">가격 비교도, 카드 계산도, 띡!</p>
      </header>

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
            placeholder="https://www.coupang.com/vp/products/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            disabled={!valid}
            className="mt-3 w-full rounded-xl bg-dk-ink py-3 text-white disabled:opacity-30"
          >
            띡! 비교하기
          </button>
        </form>
        <button type="button" className="mt-3 w-full text-sm text-dk-mute underline" onClick={() => onStart("")}>
          링크 없이 직접 가격 입력
        </button>
      </Card>

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
