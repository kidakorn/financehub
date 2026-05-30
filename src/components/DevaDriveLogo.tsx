'use client';

/**
 * DevaDriveLogo — Minimalist SVG icon combining a bold "D"
 * with a speedometer arc, in DevaDrive primary red (#c8102e).
 */

interface LogoProps {
  size?: number;
  className?: string;
}

export default function DevaDriveLogo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DevaDrive Logo"
      role="img"
    >
      {/* Outer glow circle */}
      <circle cx="24" cy="24" r="23" fill="rgba(200,16,46,0.08)" stroke="rgba(200,16,46,0.2)" strokeWidth="0.5" />

      {/* Bold D letterform */}
      <path
        d="M13 10 H21 C29.5 10 35 15.5 35 24 C35 32.5 29.5 38 21 38 H13 V10Z"
        fill="url(#redGradient)"
        opacity="0.95"
      />

      {/* Inner cutout to form the D */}
      <path
        d="M18 16 H21 C26 16 29.5 19.5 29.5 24 C29.5 28.5 26 32 21 32 H18 V16Z"
        fill="#0a0a0a"
      />

      {/* Speedometer arc — sweeps bottom-right of D */}
      <path
        d="M28 36 C31 33 33 29.5 33.5 25"
        stroke="#ef233c"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Speedometer needle tip dot */}
      <circle cx="33.5" cy="25" r="1.5" fill="#ef233c" />

      {/* Small tick marks on arc */}
      <path d="M30.5 35.5 L31.8 34" stroke="#ef233c" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M32.2 32.5 L33.8 31.5" stroke="#ef233c" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>

      <defs>
        <linearGradient id="redGradient" x1="13" y1="10" x2="35" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c8102e" />
          <stop offset="100%" stopColor="#ef233c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
