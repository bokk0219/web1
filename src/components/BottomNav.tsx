interface BottomNavProps {
  active: "home" | "items";
  onChange: (tab: "home" | "items") => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur border-t border-beige">
      <div className="max-w-md mx-auto flex">
        <NavButton label="홈" emoji="🏠" isActive={active === "home"} onClick={() => onChange("home")} />
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
        isActive ? "text-espresso font-medium" : "text-stone"
      }`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
