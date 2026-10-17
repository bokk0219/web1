import { useEffect, useState } from "react";
import Compare from "./components/Compare";
import Home from "./components/Home";
import Settings from "./components/Settings";
import { loadComparisons, loadSettings, newComparison, saveComparisons, saveSettings } from "./storage";
import type { CardSettings, Comparison } from "./types";

type View = { name: "home" } | { name: "compare"; id: string } | { name: "settings"; back: View };

export default function App() {
  const [settings, setSettings] = useState<CardSettings>(loadSettings);
  const [list, setList] = useState<Comparison[]>(loadComparisons);
  const [view, setView] = useState<View>({ name: "home" });

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveComparisons(list), [list]);
  useEffect(() => window.scrollTo(0, 0), [view.name]);

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
      {view.name === "settings" && (
        <Settings settings={settings} onChange={setSettings} onBack={() => setView(view.back)} />
      )}
    </div>
  );
}
