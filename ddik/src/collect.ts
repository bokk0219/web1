// 쇼핑몰 화면(DOM)을 붙여넣기 해석기가 읽는 글 형태로 바꾼다.
// 링크는 [글자](주소), 취소선은 ~~글자~~, 목록은 "* " 로 쓴다.
// 목록 표시가 혼자 남은 줄("*")은 다음 줄과 합친다.
// 북마크(띡 버튼)에 이 함수의 소스를 그대로 넣으므로 바깥 변수·import·함수 안 주석을 쓰면 안 된다.
export function collect(root: Node, live: boolean): string {
  const out: string[] = [];
  const BLOCK = /^(DIV|P|LI|UL|OL|DL|DT|DD|SECTION|ARTICLE|HEADER|FOOTER|NAV|MAIN|ASIDE|FORM|TABLE|TR|H[1-6])$/;
  const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|IFRAME|TEMPLATE|BUTTON|SELECT|INPUT|TEXTAREA)$/;
  const flat = (el: Element) =>
    ((live ? (el as HTMLElement).innerText : el.textContent) || "").replace(/\s+/g, " ").trim();
  const walk = (n: Node) => {
    if (n.nodeType === 3) {
      out.push((n.nodeValue || "").replace(/\s+/g, " "));
      return;
    }
    if (n.nodeType !== 1) return;
    const el = n as Element;
    const tag = el.tagName.toUpperCase();
    if (SKIP.test(tag)) return;
    if (live && getComputedStyle(el).display === "none") return;
    if (tag === "BR") { out.push("\n"); return; }
    if (tag === "A") {
      const href = (el as HTMLAnchorElement).href || "";
      const text = flat(el);
      if (text && /^https?:/.test(href)) { out.push(`[${text}](${href})`); return; }
    }
    if (tag === "DEL" || tag === "S" || tag === "STRIKE") { out.push(`~~${flat(el)}~~`); return; }
    const block = BLOCK.test(tag);
    if (block) out.push("\n");
    if (tag === "LI") out.push("* ");
    for (let c = el.firstChild; c; c = c.nextSibling) walk(c);
    if (block) out.push("\n");
  };
  walk(root);
  const lines = out.join("").split("\n").map((l) => l.trim()).filter(Boolean);
  const merged: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "*" && i + 1 < lines.length) merged.push(`* ${lines[++i]}`);
    else merged.push(lines[i]);
  }
  return merged.join("\n");
}

// 북마크 주소. 쇼핑몰 화면에서 누르면 화면 내용을 정리해 띡! 쇼핑 창으로 보낸다.
export function bookmarkletCode(appUrl: string): string {
  const appOrigin = new URL(appUrl).origin;
  const body = `(function(){
var t=(${collect.toString()})(document.body,true);
var d={type:"ddik-page",url:location.href,text:t};
var w=window.open(${JSON.stringify(appUrl + "#b")},"ddik");
if(!w){alert("띡! 쇼핑 창을 열지 못했어요. 팝업 차단을 꺼 주세요.");return;}
var ok=false,n=0;
window.addEventListener("message",function(e){if(e.data==="ddik-ok")ok=true;});
var iv=setInterval(function(){if(ok||n++>60){clearInterval(iv);return;}try{w.postMessage(d,${JSON.stringify(appOrigin)});}catch(e){}},500);
})()`;
  return "javascript:" + encodeURIComponent(body);
}
