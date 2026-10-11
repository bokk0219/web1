type Tab = "home" | "calendar" | "items";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur border-t border-line">
      <div className="max-w-md mx-auto flex">
        <NavButton label="홈" emoji="🏠" isActive={active === "home"} onClick={() => onChange("home")} />
        <NavButton label="달력" emoji="📅" isActive={active === "calendar"} onClick={() => onChange("calendar")} />
        <NavButton label="나의 항목" emoji="📋" isActive={active === "items"} onClick={() => onChange("items")} />
      </div>
    </nav>
  );
}

function NavButton({
  label,
  emoji,
  isActive,
  onClick,
}: {
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs ${
        isActive ? "text-ink font-medium" : "text-mute"
      }`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
