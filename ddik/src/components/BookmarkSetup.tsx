import { useEffect, useRef, useState } from "react";
import { bookmarkletCode } from "../collect";
import { Card } from "./ui";

export default function BookmarkSetup() {
  const code = bookmarkletCode(location.origin + location.pathname);
  const [copied, setCopied] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);
  // React는 javascript: 주소를 경고하므로 직접 넣는다 (PC에서 즐겨찾기 막대로 끌어다 놓기용)
  useEffect(() => { link.current?.setAttribute("href", code); }, [code]);

  return (
    <Card>
      <details>
        <summary className="cursor-pointer text-sm">📱 휴대폰에 「띡」 버튼 만들기 (처음 한 번)</summary>
        <div className="mt-3 space-y-4 text-sm leading-relaxed">
          <p className="text-dk-mute">
            쇼핑몰 검색 결과 화면에서 「띡」 북마크를 누르면 화면 내용이 이 앱으로 바로 넘어와요. 복사·붙여넣기가 필요 없어요.
          </p>
          <button
            type="button"
            className="w-full rounded-xl bg-dk-ink py-3 text-white"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
              } catch {
                alert("복사하지 못했어요. 아래 칸을 길게 눌러 전체 선택 후 복사해 주세요.");
              }
            }}
          >
            {copied ? "복사됨 ✓" : "① 띡 버튼 코드 복사"}
          </button>
          <textarea readOnly className="h-16 w-full rounded-xl border border-dk-line p-2 text-xs" value={code} onFocus={(e) => e.target.select()} />

          <div>
            <h3 className="text-dk-mute">갤럭시 · 안드로이드 (크롬)</h3>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>아무 화면에서 ⋮ 메뉴 → ☆ 눌러 북마크 추가</li>
              <li>⋮ → 북마크 → 방금 추가한 북마크 길게 눌러 「수정」</li>
              <li>이름: <b className="font-normal underline">띡</b>, 주소(URL): 내용을 지우고 복사한 코드 붙여넣기 → 저장</li>
              <li>쓰는 법: 쇼핑몰 검색 결과 화면에서 주소창에 「띡」 입력 → 아래 뜨는 ☆띡 누르기</li>
            </ol>
          </div>
          <div>
            <h3 className="text-dk-mute">아이폰 (사파리)</h3>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>아무 화면에서 공유 버튼 → 「북마크 추가」 → 저장</li>
              <li>북마크(책 모양) → 편집 → 방금 추가한 북마크 누르기</li>
              <li>이름: <b className="font-normal underline">띡</b>, 주소: 내용을 지우고 복사한 코드 붙여넣기 → 완료</li>
              <li>쓰는 법: 쇼핑몰 검색 결과 화면에서 주소창에 「띡」 입력 → 북마크의 띡 누르기</li>
            </ol>
          </div>
          <div>
            <h3 className="text-dk-mute">PC</h3>
            <p>
              이 버튼을 즐겨찾기 막대로 끌어다 놓으세요 →{" "}
              <a ref={link} className="rounded-lg bg-dk-accent px-3 py-1 text-white" onClick={(e) => e.preventDefault()}>띡</a>
            </p>
          </div>
          <p className="text-xs text-dk-mute">
            처음 누를 때 팝업 차단 안내가 나오면 허용해 주세요. 휴대폰용 쇼핑몰 화면은 아직 못 읽을 수 있어요. 그럴 때 나오는 「내용 복사하기」로 Claude에게 보내 주세요.
          </p>
        </div>
      </details>
    </Card>
  );
}
