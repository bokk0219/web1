import type { CSSProperties } from "react";
import ItemIcon from "./ItemIcon";

interface SplashProps {
  onStart: () => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
// 한 달(4주) 중 띄엄띄엄 일이 있는 날과 그날의 아이콘
const DROPS: { day: number; emoji: string }[] = [
  { day: 2, emoji: "🌱" },
  { day: 5, emoji: "🧺" },
  { day: 9, emoji: "💅" },
  { day: 12, emoji: "🛏️" },
  { day: 15, emoji: "🧹" },
  { day: 19, emoji: "💊" },
  { day: 22, emoji: "💇" },
  { day: 26, emoji: "🐾" },
];
const DROP_GAP = 0.32; // 아이콘이 하나씩 내려앉는 간격(초)
const LAST_LANDING = (DROPS.length - 1) * DROP_GAP + 1.6;

export default function Splash({ onStart }: SplashProps) {
  const dropByDay = new Map(DROPS.map((d, i) => [d.day, { ...d, order: i }]));
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-between overflow-hidden px-6 py-12">
      <div />
      <div className="flex w-full max-w-xs flex-col items-center gap-10">
        <div className="w-full rounded-xl border border-ink bg-card">
          <div className="h-3 rounded-t-[11px] bg-ink" />
          <div className="grid grid-cols-7 px-3 pt-2 text-center text-[10px] text-mute">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 px-3 pb-3 pt-1">
            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
              const drop = dropByDay.get(day);
              return (
                <span key={day} className="flex h-9 flex-col items-center">
                  <span className="text-[9px] leading-3 text-clay tabular-nums">{day}</span>
                  {drop && (
                    <span className="mt-0.5 animate-drop opacity-0" style={dropStyle(drop.order)}>
                      <ItemIcon emoji={drop.emoji} className="h-5 w-5" />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
        <div className="animate-fade-up text-center opacity-0" style={{ animationDelay: `${LAST_LANDING}s` }}>
          <h1 className="font-serif text-[34px] font-light text-ink">2manythings</h1>
          <p className="mt-2 text-sm text-mute">많은 일도, 차곡차곡.</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full max-w-xs animate-fade-up rounded-xl bg-ink py-3.5 font-medium text-paper opacity-0 active:scale-[0.98] transition-transform"
        style={{ animationDelay: `${LAST_LANDING + 0.3}s` }}
      >
        시작하기
      </button>
    </div>
  );
}

// 하나씩 순서대로, 살짝 기울어진 채 천천히 내려와 자리 잡는다
function dropStyle(order: number): CSSProperties {
  const rot = order % 2 === 0 ? -14 : 12;
  return { "--rot": `${rot}deg`, animationDelay: `${order * DROP_GAP}s` } as CSSProperties;
}
