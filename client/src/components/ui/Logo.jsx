const Logo = ({ size = 'md', showText = true, white = false }) => {
  const sizes = {
    sm: { icon: 28, text: 'text-base', gap: 'gap-1.5' },
    md: { icon: 36, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 52, text: 'text-3xl', gap: 'gap-3' },
    xl: { icon: 72, text: 'text-4xl', gap: 'gap-4' },
  }
  const s = sizes[size] || sizes.md
  const w = s.icon
  const h = s.icon

  return (
    <div className={`flex items-center ${s.gap} select-none`}>
      {/* SVG Icon Mark — Photoshop-style layered design */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LearnPro logo icon"
      >
        <defs>
          {/* Main gradient — deep blue to violet */}
          <linearGradient id="lp-grad-main" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* Shine overlay gradient */}
          <linearGradient id="lp-grad-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Accent glow */}
          <radialGradient id="lp-glow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>

          {/* Inner shadow filter */}
          <filter id="lp-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1e1b4b" floodOpacity="0.4" />
          </filter>

          {/* Glow filter for the play/book icon */}
          <filter id="lp-icon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="lp-rounded">
            <rect x="2" y="2" width="60" height="60" rx="16" ry="16" />
          </clipPath>
        </defs>

        {/* Base rounded square with drop shadow */}
        <rect
          x="2" y="2" width="60" height="60"
          rx="16" ry="16"
          fill="url(#lp-grad-main)"
          filter="url(#lp-shadow)"
        />

        {/* Radial glow layer */}
        <rect
          x="2" y="2" width="60" height="60"
          rx="16" ry="16"
          fill="url(#lp-glow)"
          clipPath="url(#lp-rounded)"
        />

        {/* Shine highlight top */}
        <rect
          x="2" y="2" width="60" height="30"
          rx="16" ry="16"
          fill="url(#lp-grad-shine)"
          clipPath="url(#lp-rounded)"
        />

        {/* Subtle inner border */}
        <rect
          x="2.5" y="2.5" width="59" height="59"
          rx="15.5" ry="15.5"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />

        {/* ── Icon: Open book with play triangle ── */}
        {/* Book left page */}
        <path
          d="M14 20 C14 18.9 14.9 18 16 18 L30 18 L30 46 L16 46 C14.9 46 14 45.1 14 44 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Book right page */}
        <path
          d="M34 18 L48 18 C49.1 18 50 18.9 50 20 L50 44 C50 45.1 49.1 46 48 46 L34 46 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Book spine */}
        <rect x="30" y="17" width="4" height="30" rx="2" fill="rgba(255,255,255,0.7)" />

        {/* Left page lines */}
        <line x1="18" y1="25" x2="28" y2="25" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="30" x2="28" y2="30" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="35" x2="28" y2="35" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="40" x2="24" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Right page — play triangle (video learning symbol) */}
        <circle cx="42" cy="32" r="8" fill="rgba(255,255,255,0.15)" />
        <polygon
          points="39,28 39,36 47,32"
          fill="white"
          filter="url(#lp-icon-glow)"
          opacity="0.95"
        />

        {/* Bottom accent dot row */}
        <circle cx="26" cy="50" r="1.5" fill="rgba(255,255,255,0.5)" />
        <circle cx="32" cy="50" r="1.5" fill="rgba(255,255,255,0.7)" />
        <circle cx="38" cy="50" r="1.5" fill="rgba(255,255,255,0.5)" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight ${s.text} ${
              white
                ? 'text-white'
                : 'bg-gradient-to-r from-indigo-700 via-blue-600 to-violet-600 bg-clip-text text-transparent'
            }`}
            style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", letterSpacing: '-0.03em' }}
          >
            Learn
            <span
              className={`${
                white ? 'text-white/80' : 'bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent'
              }`}
            >
              Pro
            </span>
          </span>
          <span
            className={`text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.5 ${
              white ? 'text-white/50' : 'text-indigo-400'
            }`}
          >
            Learning Platform
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
