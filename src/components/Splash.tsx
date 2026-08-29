interface SplashProps {
  onStart: () => void;
}

export default function Splash({ onStart }: SplashProps) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-between px-6 py-12">
      <div />
      <div className="flex flex-col items-center gap-8">
        <SplashIllustration />
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-ink tracking-tight">나는 이렇게 산다</h1>
          <p className="text-stone text-sm">작은 일도, 다 내 삶의 기록.</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full max-w-xs bg-espresso text-cream rounded-full py-3.5 font-medium shadow-soft active:scale-[0.98] transition-transform"
      >
        시작하기
      </button>
    </div>
  );
}

function SplashIllustration() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="105" fill="#efe4d3" />
      <rect x="40" y="130" width="140" height="10" rx="5" fill="#c9a97e" />
      <rect x="55" y="90" width="60" height="45" rx="6" fill="#8a6a4b" />
      <rect x="60" y="96" width="50" height="8" rx="4" fill="#f7f2ea" opacity="0.5" />
      <circle cx="150" cy="95" r="22" fill="#5b4636" />
      <circle cx="143" cy="90" r="2.5" fill="#f7f2ea" />
      <circle cx="157" cy="90" r="2.5" fill="#f7f2ea" />
      <path d="M144 101 Q150 105 156 101" stroke="#f7f2ea" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M136 78 Q150 62 164 78" stroke="#5b4636" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="150" cy="120" rx="10" ry="14" fill="#8d8378" />
      <path d="M140 118 Q130 110 122 116" stroke="#8d8378" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="95" y="150" width="20" height="20" rx="3" fill="#c9a97e" />
      <circle cx="105" cy="160" r="4" fill="#f7f2ea" />
    </svg>
  );
}
