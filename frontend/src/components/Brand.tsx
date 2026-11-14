import { useId } from 'react';

/** Logo Mnemonic: chữ M nối từ 3 "nút ghi nhớ", nền vuông bo góc gradient xanh–tím. */
export function MnemonicMark({ size = 24 }: { size?: number }) {
  // id riêng cho mỗi lần render để nhiều logo trên cùng trang không đè gradient của nhau
  const gradientId = `mnemonic-grad-${useId().replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mnemonic"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6f9df9" />
          <stop offset="1" stopColor="#a98cf8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gradientId})`} />
      <path
        d="M14 34V14l10 12 10-12v20"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="14" r="3.6" fill="#fff" />
      <circle cx="34" cy="14" r="3.6" fill="#fff" />
      <circle cx="24" cy="26" r="4.2" fill="#12172a" stroke="#fff" strokeWidth="2.6" />
    </svg>
  );
}

export function Brand({ size = 28 }: { size?: number }) {
  return (
    <span className="brand">
      <span className="brand-mark"><MnemonicMark size={size} /></span>
      <span className="brand-text">Mnemonic</span>
    </span>
  );
}
