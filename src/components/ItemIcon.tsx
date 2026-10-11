import { ICON_PATHS, ICON_VIEWBOX } from "../icons";

interface ItemIconProps {
  emoji: string;
  className?: string;
}

// 이모지 문자를 흑백 선 아이콘으로 그린다. 그림이 없는 이모지는 흑백 필터만 씌운다.
export default function ItemIcon({ emoji, className = "h-6 w-6" }: ItemIconProps) {
  const body = ICON_PATHS[emoji.replace(/️/g, "")];
  if (!body) {
    return (
      <span className={`inline-flex items-center justify-center grayscale ${className}`} aria-hidden="true">
        {emoji}
      </span>
    );
  }
  return (
    <svg
      viewBox={ICON_VIEWBOX}
      className={`shrink-0 text-ink ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
