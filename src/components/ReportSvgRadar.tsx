'use client';

interface RadarPoint {
  name: string;
  current: number;
  required: number;
}

interface Props {
  data: RadarPoint[];
  size?: number;
}

export function ReportSvgRadar({ data, size = 420 }: Props) {
  if (!data || data.length === 0) return null;

  const count = data.length;
  const center = size / 2;
  const maxRadius = size * 0.32; // Leave ample room for text labels around perimeter
  const maxLevel = 3; // Skala 0 - 3 (Dasar, Menengah, Lanjutan)

  const getCoordinates = (index: number, level: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const radius = (Math.max(0, Math.min(maxLevel, level)) / maxLevel) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon grids (Level 1, 2, 3)
  const gridLevels = [1, 2, 3];
  const gridPolygons = gridLevels.map((lvl) => {
    return Array.from({ length: count }, (_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x},${y}`;
    }).join(' ');
  });

  // User polygon & Target polygon
  const userPolygonPoints = data
    .map((item, i) => {
      const { x, y } = getCoordinates(i, item.current);
      return `${x},${y}`;
    })
    .join(' ');

  const targetPolygonPoints = data
    .map((item, i) => {
      const { x, y } = getCoordinates(i, item.required);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        {/* Background Concentric Polygons */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={points}
            fill={idx === 2 ? '#f8fafc' : 'none'}
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray={idx < 2 ? '3 3' : 'none'}
          />
        ))}

        {/* Axis Spokes from center to perimeter */}
        {Array.from({ length: count }, (_, i) => {
          const { x, y } = getCoordinates(i, maxLevel);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Target Profile Area (Dashed Navy) */}
        <polygon
          points={targetPolygonPoints}
          fill="rgba(45, 74, 138, 0.08)"
          stroke="#2d4a8a"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* User Current Profile Area (Solid Teal/Emerald) */}
        <polygon
          points={userPolygonPoints}
          fill="rgba(16, 149, 193, 0.25)"
          stroke="#0e7490"
          strokeWidth="2.5"
        />

        {/* User Data Dots */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, item.current);
          return (
            <circle
              key={`user-dot-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill="#0891b2"
              stroke="#ffffff"
              strokeWidth="2"
            />
          );
        })}

        {/* Target Data Dots */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, item.required);
          return (
            <circle
              key={`target-dot-${i}`}
              cx={x}
              cy={y}
              r="3.5"
              fill="#1e3a8a"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Outer Text Labels with dynamic offset */}
        {data.map((item, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
          // Offset text outside maxRadius
          const labelDist = maxRadius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          // Text anchor based on horizontal position
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          else if (Math.cos(angle) < -0.3) textAnchor = 'end';

          return (
            <g key={`label-${i}`}>
              <text
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                dominantBaseline="central"
                className="text-[11px] font-semibold fill-slate-800"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {item.name}
              </text>
              <text
                x={lx}
                y={ly + (textAnchor === 'middle' ? (ly < center ? -12 : 14) : 12)}
                textAnchor={textAnchor}
                className="text-[9.5px] fill-slate-500 font-medium"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Kamu: Lvl {item.current} | Target: Lvl {item.required}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend below chart */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-cyan-600/30 border-2 border-cyan-700" />
          <span className="font-semibold text-slate-700">Kompetensi Kamu Saat Ini</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 border-t-2 border-dashed border-indigo-900" />
          <span className="font-semibold text-slate-700">Standar Industri Target Role</span>
        </div>
      </div>
    </div>
  );
}
