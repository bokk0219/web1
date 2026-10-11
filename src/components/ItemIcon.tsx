interface ItemIconProps {
  emoji: string;
  size?: number;
  className?: string;
}

// 이모지를 Noto Emoji 글꼴(흑백, 둥근 선)로 그린다.
// 저장된 데이터는 이모지 문자 그대로 두고, 화면에서만 흑백으로 보이게 한다.
export default function ItemIcon({ emoji, size = 24, className = "" }: ItemIconProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-emoji leading-none text-ink ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.9 }}
      aria-hidden="true"
    >
      {emoji.replace(/️/g, "") + "︎"}
    </span>
  );
}
