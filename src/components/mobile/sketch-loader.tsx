"use client";

export function SketchLoader() {
  return (
    <div className="relative w-[200px] h-[200px]">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Hand-drawn wobble filter */}
          <filter id="roughen" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
            />
          </filter>

          <filter id="roughen-strong" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
            />
          </filter>

          {/* Clip path for the globe interior */}
          <clipPath id="globe-clip">
            <circle cx="100" cy="100" r="36" />
          </clipPath>

          {/* Invisible orbit paths for the plane + car motion */}
          <ellipse
            id="orbit-a"
            cx="100"
            cy="100"
            rx="72"
            ry="50"
            transform="rotate(-20 100 100)"
            fill="none"
          />
          <ellipse
            id="orbit-b"
            cx="100"
            cy="100"
            rx="68"
            ry="48"
            transform="rotate(25 100 100)"
            fill="none"
          />
        </defs>

        {/* ── Sparkles along the outer perimeter (pulsing) ── */}
        <g filter="url(#roughen)">
          {[
            { x: 100, y: 10, color: "#10b981", delay: 0 },
            { x: 175, y: 45, color: "#f97316", delay: 0.4 },
            { x: 190, y: 120, color: "#3b82f6", delay: 0.8 },
            { x: 155, y: 180, color: "#10b981", delay: 1.2 },
            { x: 70, y: 190, color: "#f97316", delay: 1.6 },
            { x: 15, y: 140, color: "#3b82f6", delay: 2.0 },
            { x: 25, y: 55, color: "#10b981", delay: 2.4 },
            { x: 60, y: 15, color: "#f97316", delay: 2.8 },
          ].map((s, i) => (
            <g
              key={i}
              style={{
                transformOrigin: `${s.x}px ${s.y}px`,
                animation: `sparkle-pulse 2.4s ease-in-out ${s.delay}s infinite`,
              }}
            >
              {/* 4-point star sparkle */}
              <path
                d={`M ${s.x} ${s.y - 5} L ${s.x + 1.5} ${s.y - 1.5} L ${s.x + 5} ${s.y} L ${s.x + 1.5} ${s.y + 1.5} L ${s.x} ${s.y + 5} L ${s.x - 1.5} ${s.y + 1.5} L ${s.x - 5} ${s.y} L ${s.x - 1.5} ${s.y - 1.5} Z`}
                fill={s.color}
                opacity="0.9"
              />
            </g>
          ))}
        </g>

        {/* ── Orange trailing arc (rotates counter-clockwise) ── */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "loader-spin-ccw 4s linear infinite",
          }}
        >
          <path
            d="M 100 35 A 65 65 0 0 1 165 100"
            fill="none"
            stroke="#f97316"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#roughen)"
          />
          {/* Short trailing dash at the tip */}
          <path
            d="M 164 92 L 168 88"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>

        {/* ── Dashed charcoal whirl ring (rotates clockwise) ── */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "loader-spin-cw 6s linear infinite",
          }}
        >
          <circle
            cx="100"
            cy="100"
            r="55"
            fill="none"
            stroke="#1f2937"
            strokeWidth="2.2"
            strokeDasharray="5 5"
            strokeLinecap="round"
            filter="url(#roughen)"
            opacity="0.85"
          />
        </g>

        {/* ── Globe (outline + continents + meridians) ── */}
        <g filter="url(#roughen)">
          {/* Globe outer circle */}
          <circle
            cx="100"
            cy="100"
            r="36"
            fill="#fffdf8"
            stroke="#1f2937"
            strokeWidth="2.2"
          />

          {/* Continents scroll horizontally (clipped inside globe) */}
          <g clipPath="url(#globe-clip)">
            <g
              style={{
                animation: "globe-rotate 8s linear infinite",
              }}
            >
              {/* First set of continents */}
              <g>
                {/* Continent 1 - top-left blob */}
                <path
                  d="M 68 82 C 72 78, 78 79, 82 83 C 85 87, 83 91, 80 93 L 72 92 C 68 90, 65 86, 68 82 Z"
                  fill="#10b981"
                  opacity="0.9"
                />
                {/* Continent 2 - middle */}
                <path
                  d="M 92 98 C 96 95, 102 96, 105 101 C 108 106, 103 110, 98 109 C 93 108, 90 104, 92 98 Z"
                  fill="#10b981"
                  opacity="0.9"
                />
                {/* Continent 3 - bottom */}
                <path
                  d="M 76 110 C 80 108, 85 110, 87 114 C 88 118, 84 121, 80 120 C 76 119, 74 114, 76 110 Z"
                  fill="#10b981"
                  opacity="0.9"
                />
              </g>

              {/* Duplicated set offset by 72px for seamless loop */}
              <g transform="translate(72, 0)">
                <path
                  d="M 68 82 C 72 78, 78 79, 82 83 C 85 87, 83 91, 80 93 L 72 92 C 68 90, 65 86, 68 82 Z"
                  fill="#10b981"
                  opacity="0.9"
                />
                <path
                  d="M 92 98 C 96 95, 102 96, 105 101 C 108 106, 103 110, 98 109 C 93 108, 90 104, 92 98 Z"
                  fill="#10b981"
                  opacity="0.9"
                />
                <path
                  d="M 76 110 C 80 108, 85 110, 87 114 C 88 118, 84 121, 80 120 C 76 119, 74 114, 76 110 Z"
                  fill="#10b981"
                  opacity="0.9"
                />
              </g>
            </g>
          </g>

          {/* Meridians (latitude / longitude sketch lines on globe) */}
          <g clipPath="url(#globe-clip)">
            <path
              d="M 64 100 Q 100 110, 136 100"
              fill="none"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
            <path
              d="M 64 100 Q 100 88, 136 100"
              fill="none"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.3"
            />
            <path
              d="M 100 64 Q 92 100, 100 136"
              fill="none"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
            <path
              d="M 100 64 Q 108 100, 100 136"
              fill="none"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.3"
            />
          </g>
        </g>

        {/* ── Plane orbiting on tilted path ── */}
        <g filter="url(#roughen-strong)">
          <g>
            <animateMotion
              dur="5s"
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href="#orbit-a" />
            </animateMotion>
            {/* Abstract plane mark */}
            <g transform="translate(-6, -4)">
              <path
                d="M 0 4 L 10 4 L 12 2 L 12 6 L 10 4 M 4 2 L 6 2 L 7 4 M 4 6 L 6 6 L 7 4"
                stroke="#3b82f6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#3b82f6"
              />
            </g>
          </g>
        </g>

        {/* ── Car / vehicle mark orbiting on second tilted path ── */}
        <g filter="url(#roughen-strong)">
          <g>
            <animateMotion
              dur="6.5s"
              repeatCount="indefinite"
              rotate="auto"
              begin="1s"
            >
              <mpath href="#orbit-b" />
            </animateMotion>
            {/* Abstract car mark */}
            <g transform="translate(-5, -3)">
              <path
                d="M 0 4 L 2 2 L 7 2 L 9 4 L 10 4 L 10 6 L 0 6 Z"
                stroke="#1f2937"
                strokeWidth="1.6"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="2.5" cy="6" r="1.2" fill="#1f2937" />
              <circle cx="7.5" cy="6" r="1.2" fill="#1f2937" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
