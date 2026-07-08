interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ className = "", showTagline = true }: LogoProps) {
  return (
    <svg
      viewBox="0 0 400 155"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="stagename.club — Find Your Stage Name"
    >
      {/* Microphone icon */}
      <g transform="translate(200, 38)">
        {/* Capsule — tilted left */}
        <rect
          x="-9"
          y="-22"
          width="18"
          height="44"
          rx="9"
          transform="rotate(-30)"
          fill="#1C1D1F"
        />
        {/* Pop filter / foam — coral orange, right side */}
        <circle cx="13" cy="-11" r="5.5" fill="#F15A38" />
        {/* Stand */}
        <rect x="-2.5" y="22" width="5" height="16" fill="#1C1D1F" />
        {/* Base */}
        <rect x="-11" y="38" width="22" height="4" rx="2" fill="#1C1D1F" />
      </g>

      {/* Brand name */}
      <text
        x="200"
        y="98"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="700"
        fontSize="34"
      >
        <tspan fill="#1C1D1F">stagename</tspan>
        <tspan fill="#F15A38">.club</tspan>
      </text>

      {/* Tagline */}
      {showTagline && (
        <text
          x="200"
          y="126"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
          fontWeight="500"
          fontSize="11"
          fill="#656B73"
          letterSpacing="3.5"
        >
          FIND YOUR STAGE NAME
        </text>
      )}
    </svg>
  );
}
