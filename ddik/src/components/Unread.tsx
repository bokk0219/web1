import { useState } from "react";
import type { PageMessage } from "../inbox";
import { Card } from "./ui";

// 띡 버튼으로 받았지만 상품을 못 읽은 화면. 내용을 복사해 Claude에게 보내면 해석기를 고칠 수 있다.
export default function Unread({ page, onBack }: { page: PageMessage; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const sample = `${page.url}\n${page.text}`;
  return (
    <div className="space-y-6">
      <button type="button" className="pt-4 text-sm text-dk-mute" onClick={onBack}>← 홈</button>
      <Card className="space-y-3">
        <h1 className="text-xl">이 화면은 아직 못 읽어요</h1>
        <p className="text-sm leading-relaxed text-dk-mute">
          네이버·G마켓·11번가의 <b className="font-normal text-dk-ink">검색 결과</b> 화면에서 눌러 주세요.
          검색 결과 화면인데도 안 되면 아래 버튼으로 내용을 복사해서 Claude에게 보내 주세요. 이 화면 형식을 읽도록 고칠게요.
        </p>
        <p className="break-all text-xs text-dk-mute">{page.url}</p>
        <button
          type="button"
          className="w-full rounded-xl bg-dk-ink py-3 text-white"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(sample);
              setCopied(true);
            } catch {
              alert("복사하지 못했어요. 아래 내용을 길게 눌러 복사해 주세요.");
            }
          }}
        >
          {copied ? "복사됨 — Claude 채팅에 붙여넣기" : "내용 복사하기"}
        </button>
        <textarea readOnly className="h-40 w-full rounded-xl border border-dk-line p-2 text-xs" value={sample.slice(0, 20000)} />
      </Card>
    </div>
  );
}
