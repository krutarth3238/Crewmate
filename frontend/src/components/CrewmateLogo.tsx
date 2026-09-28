import React from 'react';

interface CrewmateMarkProps {
  className?: string;
  size?: number | string;
  variant?: 'color' | 'white' | 'dark' | 'monochrome';
}

/**
 * Crewmate Mark (Icon Only)
 * Mathematical reconstruction of the official Crewmate glyph:
 * - Left: Blue arched body with progress-step arch cutout (Letter C + Teammate 1)
 * - Right: Lime capsule body + floating circle head (Teammate 2 + Progress)
 */
export const CrewmateMark: React.FC<CrewmateMarkProps> = ({
  className = '',
  size = 32,
  variant = 'color',
}) => {
  // Determine fill colors based on variant
  let blueFill = '#1344FF';
  let limeFill = '#D6F830';

  if (variant === 'white') {
    blueFill = '#FFFFFF';
    limeFill = '#D6F830'; // keeps the signature lime punch or all white
  } else if (variant === 'monochrome') {
    blueFill = 'currentColor';
    limeFill = 'currentColor';
  } else if (variant === 'dark') {
    blueFill = '#0D0E11';
    limeFill = '#1344FF';
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Crewmate icon"
    >
      {/* 1. Left Shape: Cobalt Blue Arched Body with Inner Arch Notch */}
      {/* 
        Outer bounds: x from 6 to 54, y from 14 to 94
        Left pillar: x=6 to x=24
        Inner arch cutout: x=24 to x=38, y from 52 to 94 (rounded top at y=52)
        Right pillar: x=38 to x=54, y from 44 to 94
        Top dome connects outer left pillar to inner right pillar smoothly
      */}
      <path
        d="M 6 50
           C 6 26, 20 14, 42 14
           C 49 14, 52 17, 54 22
           L 54 90
           C 54 92.5, 52 94, 49.5 94
           L 41 94
           C 39 94, 38 92.5, 38 90
           L 38 58
           C 38 52, 35 48, 30 48
           C 25 48, 22 52, 22 58
           L 22 90
           C 22 92.5, 20.5 94, 18 94
           L 10 94
           C 7.5 94, 6 92.5, 6 90
           Z"
        fill={blueFill}
      />

      {/* 2. Right Shape Top: Lime Floating Circle Head */}
      <circle
        cx="77"
        cy="21"
        r="12.5"
        fill={limeFill}
      />

      {/* 3. Right Shape Bottom: Lime Capsule Pillar */}
      <rect
        x="64"
        y="42"
        width="26"
        height="52"
        rx="13"
        fill={limeFill}
      />
    </svg>
  );
};

interface CrewmateLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'white' | 'dark';
  withTagline?: boolean;
  markOnly?: boolean;
}

export const CrewmateLogo: React.FC<CrewmateLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'color',
  withTagline = false,
  markOnly = false,
}) => {
  // Proportions according to size
  const sizeConfig = {
    sm: { markSize: 26, titleSize: 'text-lg', tagSize: 'text-[8px]', gap: 'gap-2' },
    md: { markSize: 34, titleSize: 'text-2xl', tagSize: 'text-[9px]', gap: 'gap-2.5' },
    lg: { markSize: 44, titleSize: 'text-3xl', tagSize: 'text-[10px]', gap: 'gap-3' },
    xl: { markSize: 58, titleSize: 'text-4xl sm:text-5xl', tagSize: 'text-[11px] sm:text-xs', gap: 'gap-4' },
  }[size];

  const textColor = variant === 'white' ? 'text-white' : 'text-[#0D0E11]';
  const tagColor = variant === 'white' ? 'text-neutral-400' : 'text-neutral-600';

  if (markOnly) {
    return <CrewmateMark size={sizeConfig.markSize} variant={variant} className={className} />;
  }

  return (
    <div className={`inline-flex items-center ${sizeConfig.gap} select-none ${className}`}>
      <CrewmateMark size={sizeConfig.markSize} variant={variant} />
      
      <div className="flex flex-col justify-center">
        <span
          className={`font-clash font-bold tracking-tight leading-none ${sizeConfig.titleSize} ${textColor}`}
          style={{
            fontFamily: "'Clash Display', 'Cabinet Grotesk', 'Worry-Free!DylanWiescher-Design', 'Dylan', sans-serif",
            fontWeight: 700,
            letterSpacing: '-0.025em'
          }}
        >
          Crewmate
        </span>
        {withTagline && (
          <span
            className={`font-mono font-bold uppercase tracking-[0.28em] mt-1 ${sizeConfig.tagSize} ${tagColor}`}
            style={{
              letterSpacing: '0.28em'
            }}
          >
            PROGRESS BUILDS TOGETHER
          </span>
        )}
      </div>
    </div>
  );
};
