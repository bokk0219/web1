import { useEffect, useRef, useState } from "react";
import Compare from "./components/Compare";
import Home from "./components/Home";
import Settings from "./components/Settings";
import Unread from "./components/Unread";
import { applyPaste } from "./components/paste";
import { onPage, type PageMessage } from "./inbox";
import { loadComparisons, loadSettings, newComparison, saveComparisons, saveSettings } from "./storage";
import type { CardSettings, Comparison } from "./types";

type View =
  | { name: "home" }
  | { name: "compare"; id: string }
  | { name: "settings"; back: View }
  | { name: "unread"; page: PageMessage };

const RECENT_MS = 30 * 60 * 1000;

export default function App() {
  const [settings, setSettings] = useState<CardSettings>(loadSettings);
  const [list, setList] = useState<Comparison[]>(loadComparisons);
  const [view, setView] = useState<View>({ name: "home" });

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveComparisons(list), [list]);
  useEffect(() => window.scrollTo(0, 0), [view.name]);

  // 띡 버튼으로 받은 화면: 30분 안에 보던 비교가 있으면 거기에 더하고, 없으면 새 비교를 만든다
  const listRef = useRef(list);
  listRef.current = list;
  useEffect(() => onPage((page) => {
    const top = listRef.current[0];
    const recent = top && Date.now() - Date.parse(top.updatedAt) < RECENT_MS ? top : newComparison();
    const r = applyPaste(recent, `${page.url}\n${page.text}`);
    if (r.found === 0) setView({ name: "unread", page });
    else {
      upsert(r.cmp);
      setView({ name: "compare", id: r.cmp.id });
    }
    if (location.hash) history.replaceState(null, "", location.pathname);
  }), []);

  const current = view.name === "compare" ? list.find((c) => c.id === view.id) : undefined;
  const upsert = (c: Comparison) =>
    setList((l) => [{ ...c, updatedAt: new Date().toISOString() }, ...l.filter((x) => x.id !== c.id)]);
  const openSettings = () => setView({ name: "settings", back: view.name === "settings" ? { name: "home" } : view });

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-16">
      {view.name !== "settings" && (
        <div className="flex justify-end pt-4">
          <button type="button" className="text-sm text-dk-mute underline" onClick={openSettings}>카드 설정</button>
        </div>
      )}
      {view.name === "home" && (
        <Home
          recent={list}
          onStart={(url) => {
            const c = newComparison(url);
            upsert(c);
            setView({ name: "compare", id: c.id });
          }}
          onPaste={(text) => {
            const r = applyPaste(newComparison(), text);
            if (r.found > 0) {
              upsert(r.cmp);
              setView({ name: "compare", id: r.cmp.id });
            }
            return r;
          }}
          onOpen={(id) => setView({ name: "compare", id })}
          onDelete={(id) => setList((l) => l.filter((c) => c.id !== id))}
        />
      )}
      {view.name === "compare" && current && (
        <Compare
          comparison={current}
          settings={settings}
          onChange={upsert}
          onBack={() => setView({ name: "home" })}
          onSettings={openSettings}
        />
      )}
      {view.name === "unread" && <Unread page={view.page} onBack={() => setView({ name: "home" })} />}
      {view.name === "settings" && (
        <Settings settings={settings} onChange={setSettings} onBack={() => setView(view.back)} />
      )}
    </div>
  );
}
