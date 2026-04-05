import type { Label } from '@/types';

interface Props {
  label: Label;
  onRemove?: () => void;
}

// Определяем светлый/тёмный текст по яркости фона
function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export function LabelBadge({ label, onRemove }: Props) {
  const textColor = isDark(label.color) ? '#fff' : '#1f2937';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: label.color, color: textColor }}
    >
      {label.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-70 hover:opacity-100 leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
