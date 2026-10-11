import { useEffect, useRef, type CSSProperties } from "react";
import ItemIcon from "./ItemIcon";

interface SplashProps {
  firstVisit: boolean;
  onStart: () => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
// 한 달(4주) 중 띄엄띄엄 일이 있는 날. 줄을 맞추지 않고, 떨어지는 순서·방향·속도도 제각각
const DROPS: { day: number; emoji: string; delay: number; dx: number; rot: number; dur: number }[] = [
  { day: 12, emoji: "🛏️", delay: 0, dx: -60, rot: -25, dur: 1.7 },
  { day: 3, emoji: "🌱", delay: 0.25, dx: 70, rot: 20, dur: 1.5 },
  { day: 22, emoji: "💇", delay: 0.7, dx: 90, rot: 30, dur: 1.9 },
  { day: 18, emoji: "🧹", delay: 0.85, dx: -40, rot: -15, dur: 1.6 },
  { day: 7, emoji: "🧺", delay: 1.3, dx: -80, rot: 18, dur: 1.8 },
  { day: 27, emoji: "🐾", delay: 1.45, dx: -50, rot: -30, dur: 1.5 },
  { day: 9, emoji: "💅", delay: 1.9, dx: 60, rot: 24, dur: 1.7 },
  { day: 20, emoji: "💊", delay: 2.2, dx: 40, rot: -20, dur: 1.6 },
];
const LAST_LANDING = Math.max(...DROPS.map((d) => d.delay + d.dur));

// 처음 쓰는 사람은 「시작하기」를 누르고, 다시 여는 사람은 애니메이션이 끝나면 저절로 홈으로 넘어간다.
// 기다리기 싫으면 화면을 누르면 바로 넘어간다.
export default function Splash({ firstVisit, onStart }: SplashProps) {
  const dropByDay = new Map(DROPS.map((d) => [d.day, d]));
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;
  useEffect(() => {
    if (firstVisit) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => onStartRef.current(), reduced ? 800 : (LAST_LANDING + 1) * 1000);
    return () => clearTimeout(timer);
  }, [firstVisit]);
  return (
    <div
      className="min-h-screen bg-paper flex flex-col items-center justify-between overflow-hidden px-6 py-12"
      onClick={firstVisit ? undefined : onStart}
    >
      <div />
      <div className="flex w-full max-w-xs flex-col items-center gap-10">
        <div className="animate-fade-up text-center opacity-0" style={{ animationDelay: `${LAST_LANDING}s` }}>
          <h1 className="text-[34px] text-ink">2manythings</h1>
          <p className="mt-2 text-sm text-mute">많은 일도, 차곡차곡.</p>
        </div>
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
                    <span className="mt-0.5 animate-drop opacity-0" style={dropStyle(drop)}>
                      <ItemIcon emoji={drop.emoji} size={20} />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      {firstVisit ? (
        <button
          onClick={onStart}
          className="w-full max-w-xs animate-fade-up rounded-xl bg-ink py-3.5 font-medium text-paper opacity-0 active:scale-[0.98] transition-transform"
          style={{ animationDelay: `${LAST_LANDING + 0.3}s` }}
        >
          시작하기
        </button>
      ) : (
        <p className="animate-fade-up text-xs text-mute opacity-0" style={{ animationDelay: "1s" }}>
          화면을 누르면 바로 시작해요
        </p>
      )}
    </div>
  );
}

// 옆에서 비스듬히 날아와 제자리에 내려앉는다
function dropStyle(d: (typeof DROPS)[number]): CSSProperties {
  return {
    "--dx": `${d.dx}px`,
    "--rot": `${d.rot}deg`,
    animationDelay: `${d.delay}s`,
    animationDuration: `${d.dur}s`,
  } as CSSProperties;
}
