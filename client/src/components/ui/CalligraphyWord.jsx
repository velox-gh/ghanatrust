import { useId } from 'react';

/**
 * CalligraphyWord — a word set in white copperplate calligraphy that writes
 * itself on: an ink mask sweeps left-to-right across the glyphs while a swash
 * flourish draws beneath them.
 *
 * Sized in `em`, so it scales with whatever headline it sits inside. Motion is
 * `forwards`-filled, so the reduced-motion override in index.css lands it on
 * the finished frame instead of leaving it blank.
 */
const CalligraphyWord = ({ children, className = '', delay = 0.35 }) => {
  // useId keeps mask/gradient ids unique when the word appears more than once.
  const uid = useId().replace(/:/g, '');
  const maskId = `ink-${uid}`;
  const fadeId = `fade-${uid}`;

  return (
    <span className={`calligraphy-word ${className}`} style={{ '--calligraphy-delay': `${delay}s` }}>
      <svg
        viewBox="0 0 300 130"
        className="calligraphy-svg"
        role="img"
        aria-label={children}
        focusable="false"
      >
        <defs>
          {/* Feathered wipe edge — the ink arrives wet rather than as a hard bar */}
          <linearGradient id={fadeId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="82%" stopColor="#fff" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="130">
            <rect className="calligraphy-ink" x="0" y="0" width="300" height="130" fill={`url(#${fadeId})`} />
          </mask>
        </defs>

        <g mask={`url(#${maskId})`}>
          <text
            x="150"
            y="86"
            textAnchor="middle"
            className="calligraphy-glyphs"
            fill="currentColor"
          >
            {children}
          </text>
        </g>

        {/* Underline swash — one pen stroke, drawn with a dash offset so it
            travels rather than fades in. Rises at the exit like a real lift-off. */}
        <path
          className="calligraphy-swash"
          d="M34 104c52 13 128 14 186 1 20-5 38-12 48-21"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </span>
  );
};

export default CalligraphyWord;
