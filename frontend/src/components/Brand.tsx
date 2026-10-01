function BowArrowCodeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Bow String (Dây cung) */}
      <line
        x1="7"
        y1="7"
        x2="7"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.85"
      />
      <line
        x1="7"
        y1="25"
        x2="27"
        y2="27"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.6"
      />

      {/* Main Bow Curve (Thân Cung) */}
      <path
        d="M7 7 C 6 4, 3 4, 3 6.5 C 3 8, 6 8.5, 7.5 9 C 14 11, 23 14, 27 25 C 28 27.5, 29 29, 27.5 30 C 26 31, 24.5 29, 25 27.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Swirl Spiral Top Left */}
      <path
        d="M7.5 7.5 C 6.5 5.5, 4.5 5, 4 6.5 C 3.6 7.8, 5 9, 6.5 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Swirl Spiral Bottom Right */}
      <path
        d="M26.5 26.5 C 28.5 27.5, 29 29.5, 27.5 30 C 26.2 30.4, 25 29, 26 27.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Diagonal Arrow Shaft (Thân Mũi Tên) */}
      <line
        x1="3"
        y1="29"
        x2="26"
        y2="6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Arrowhead Point (Đầu Mũi Tên) */}
      <path
        d="M23 4 L28 9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Code Chevrons around Tip (< ^ > v Arrowhead Target) */}
      <path
        d="M25 2 L29 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M22 6 L24 2 M28 6 L30 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Arrow Fletching Tail (Đuôi Mũi Tên) */}
      <path
        d="M5 28 L2 24 M7 30 L4 26 M9 31 L7 28"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Code Symbols < { } > */}
      <path
        d="M10 12 L8.5 13.5 L10 15"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M13 11.5 C 12.5 12.2, 12.5 12.8, 12 13.5 C 12.5 14.2, 12.5 14.8, 13 15.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M15 11.5 C 15.5 12.2, 15.5 12.8, 16 13.5 C 15.5 14.2, 15.5 14.8, 15 15.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M18 12 L19.5 13.5 L18 15"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

export function Brand({ size = 24 }: { size?: number }) {
  return (
    <span className="brand">
      <span className="brand-mark"><BowArrowCodeIcon size={size} /></span>
      <span className="brand-text">Mnemonic</span>
    </span>
  );
}
