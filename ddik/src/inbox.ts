import { collect } from "./collect";

// 띡 버튼(북마크)이 보내는 쇼핑몰 화면을 받는다.
// React가 뜨기 전에 도착할 수 있으므로 모듈을 불러오는 즉시 듣기 시작하고 쌓아 둔다.
export interface PageMessage {
  url: string;
  text: string;
}

let queue: PageMessage[] = [];
let listener: ((m: PageMessage) => void) | null = null;
let last = "";

window.addEventListener("message", (e) => {
  const d = e.data;
  if (!d || d.type !== "ddik-html" || typeof d.html !== "string") return;
  (e.source as Window | null)?.postMessage("ddik-ok", e.origin);
  // 확인 응답이 닿기 전에 같은 화면이 여러 번 올 수 있다
  const key = d.url + d.html.length;
  if (key === last) return;
  last = key;
  const text = collect(new DOMParser().parseFromString(d.html, "text/html").body, false);
  const m = { url: String(d.url || ""), text };
  if (listener) listener(m);
  else queue.push(m);
});

export function onPage(fn: (m: PageMessage) => void) {
  listener = fn;
  queue.forEach(fn);
  queue = [];
  return () => { listener = null; };
}
