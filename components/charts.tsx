export function DonutChart({
  segments
}: {
  segments: Array<{ value: number; color: string }>;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let cumulative = 0;

  return (
    <svg className="h-56 w-56" viewBox="0 0 120 120">
      <circle cx="60" cy="60" fill="none" r="38" stroke="#e6eefc" strokeWidth="12" />
      {segments.map((segment, index) => {
        const dashArray = `${(segment.value / total) * 239} 239`;
        const dashOffset = -cumulative;
        cumulative += (segment.value / total) * 239;

        return (
          <circle
            key={`${segment.color}-${index}`}
            cx="60"
            cy="60"
            fill="none"
            r="38"
            stroke={segment.color}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="12"
            transform="rotate(-90 60 60)"
          />
        );
      })}
    </svg>
  );
}

export function LineTrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 280 + 16;
      const y = 180 - (point / max) * 120;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-64 w-full" fill="none" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00685f" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#00685f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M16 180H304" stroke="#edf2ff" strokeWidth="1.5" />
      <path d={`M ${points} L 296,180 L 16,180 Z`} fill="url(#lineFill)" />
      <polyline points={points} stroke="#00685f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}
