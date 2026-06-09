// The Unwrap brand mark + wordmark, inline so it stays crisp and inherits theme
// colors. The mark is a gift box with its lid lifting and a spark escaping — the
// moment of unwrapping. See BRANDING.md for usage rules.

interface Props {
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ size = 40, showWordmark = true }: Props) {
  return (
    <span className="brand-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Unwrap">
        <defs>
          <linearGradient id="unwrapWarm" x1="12" y1="14" x2="52" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e0a23c" />
            <stop offset="0.55" stopColor="#cf6a45" />
            <stop offset="1" stopColor="#b6432b" />
          </linearGradient>
        </defs>
        <path d="M45 8 L47 14 L53 16 L47 18 L45 24 L43 18 L37 16 L43 14 Z" fill="#e0a23c" />
        <circle cx="52" cy="25" r="1.8" fill="#cf6a45" />
        <circle cx="38" cy="9" r="1.4" fill="#e0a23c" />
        <rect x="13" y="31" width="38" height="21" rx="4" fill="url(#unwrapWarm)" />
        <rect x="29.5" y="31" width="5" height="21" fill="#fdf4e6" />
        <g transform="rotate(-7 32 27)">
          <rect x="9" y="22" width="46" height="11" rx="3" fill="#e0a23c" />
          <rect x="29.5" y="22" width="5" height="11" fill="#fdf4e6" />
        </g>
      </svg>
      {showWordmark && <span className="brand-wordmark">Unwrap</span>}
    </span>
  );
}
