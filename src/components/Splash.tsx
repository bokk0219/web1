import type { CSSProperties } from "react";
import ItemIcon from "./ItemIcon";
import { ICON_CATEGORIES } from "../storage";

interface SplashProps {
  onStart: () => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
// 달력 두 주(14칸)에 떨어질 아이콘
const FALLING = ICON_CATEGORIES.flatMap((c) => c.emojis).slice(0, 14);

export default function Splash({ onStart }: SplashProps) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-between overflow-hidden px-6 py-12">
      <div />
      <div className="flex w-full max-w-xs flex-col items-center gap-10">
        <div className="w-full rounded-xl border border-ink bg-card">
          <div className="h-3 rounded-t-[11px] bg-ink" />
          <div className="grid grid-cols-7 gap-y-1 px-3 pt-2 text-center text-[10px] text-mute">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2 px-3 pb-4 pt-2">
            {FALLING.map((emoji, i) => (
              <span key={emoji} className="flex justify-center">
                <span className="animate-drop opacity-0" style={dropStyle(i)}>
                  <ItemIcon emoji={emoji} className="h-6 w-6" />
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="animate-fade-up text-center opacity-0 [animation-delay:2.1s]">
          <h1 className="font-serif text-[34px] font-light text-ink">2manythings</h1>
          <p className="mt-2 text-sm text-mute">많은 일도, 차곡차곡.</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full max-w-xs animate-fade-up rounded-xl bg-ink py-3.5 font-medium text-paper opacity-0 [animation-delay:2.4s] active:scale-[0.98] transition-transform"
      >
        시작하기
      </button>
    </div>
  );
}

// 아이콘마다 떨어지는 위치·기울기·순서를 조금씩 다르게 해서 쏟아지는 느낌을 낸다
function dropStyle(i: number): CSSProperties {
  const dx = ((i * 53) % 140) - 70;
  const rot = ((i * 97) % 120) - 60;
  const delay = ((i * 37) % 14) * 0.08;
  return {
    "--dx": `${dx}px`,
    "--rot": `${rot}deg`,
    animationDelay: `${delay}s`,
  } as CSSProperties;
}
