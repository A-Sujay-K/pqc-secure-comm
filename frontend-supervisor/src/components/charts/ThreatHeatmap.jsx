import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '../../theme/useTheme';

/**
 * Custom Tooltip for Threat Score Timeline
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isCritical = data.score >= 0.70;

    return (
      <div className="surface-inner bg-[var(--surface-bg)] border border-[var(--edge-rest)] p-2.5 rounded-xl shadow-xl text-xs font-sans">
        <div className="text-[var(--text-secondary)] text-[10px] pb-1 border-b border-[var(--edge-rest)] mb-1.5 flex justify-between gap-4">
          <span>Time</span>
          <span className="text-[var(--text-primary)] font-mono">{data.displayTime}</span>
        </div>
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-[var(--text-secondary)]">Threat score:</span>
          <span className={`font-medium tabular-nums ${isCritical ? 'text-[var(--col-critical)]' : 'text-[var(--text-primary)]'}`}>
            {Number(data.score).toFixed(3)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[var(--text-secondary)]">Routed lane:</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
              isCritical
                ? 'bg-[var(--col-critical)]/15 text-[var(--col-critical)]'
                : 'bg-[var(--col-standard)]/15 text-[var(--col-standard)]'
            }`}
          >
            {data.lane === 'critical' || isCritical ? 'Critical Lane' : 'Standard Lane'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * ThreatHeatmap — SUPERVISOR App (Reference B style)
 * Beautiful natural curved spline graph (type="natural") with subtle area fill (<= 6%),
 * flowing neutral curve line, threshold line at 0.70, and critical alert markers.
 */
const ThreatHeatmap = ({ data = [], threshold = 0.70 }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gridStroke = isDark ? 'rgba(255, 245, 230, 0.06)' : 'rgba(42, 32, 24, 0.08)';
  const axisLineStroke = 'var(--edge-rest)';
  const axisTextFill = isDark ? 'rgba(255, 245, 230, 0.45)' : 'rgba(42, 32, 24, 0.55)';
  const lineStroke = isDark ? '#f0e8dc' : '#2a2018';
  const critColor = isDark ? '#f59e0b' : '#b45309';

  // Strictly sort real telemetry events chronologically without synthetic wave data
  const chartPoints = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const sorted = [...data].sort((a, b) => a.time - b.time);
    
    // If only 1 real event exists, duplicate it slightly to draw a baseline span
    if (sorted.length === 1) {
      const p = sorted[0];
      return [
        { ...p, id: `${p.id}-pre`, time: p.time - 5000, displayTime: p.displayTime, isAnchor: true },
        p,
        { ...p, id: `${p.id}-post`, time: p.time + 5000, displayTime: p.displayTime, isAnchor: true }
      ];
    }

    return sorted;
  }, [data]);

  const isEmpty = !chartPoints || chartPoints.length === 0;

  return (
    <div className="w-full h-full select-none relative">
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center px-4">
          <p className="text-xs text-[var(--text-tertiary)] font-sans">
            Awaiting Traffic Telemetry
          </p>
          <span className="text-[10px] font-mono text-[var(--col-critical)] mt-0.5 opacity-80">
            Threshold: {threshold.toFixed(2)}
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartPoints} margin={{ top: 12, right: 12, left: -22, bottom: 6 }}>
          <defs>
            <linearGradient id="threatAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={critColor} stopOpacity={0.12} />
              <stop offset="60%" stopColor={lineStroke} stopOpacity={0.04} />
              <stop offset="100%" stopColor={lineStroke} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />

          <XAxis
            dataKey="displayTime"
            stroke={axisTextFill}
            fontSize={9}
            fontFamily="var(--font-mono, monospace)"
            tickLine={false}
            axisLine={{ stroke: axisLineStroke }}
            minTickGap={25}
          />

          <YAxis
            domain={[0, 1.0]}
            ticks={[0, 0.25, 0.5, 0.75, 1.0]}
            stroke={axisTextFill}
            fontSize={9}
            fontFamily="var(--font-mono, monospace)"
            tickLine={false}
            axisLine={{ stroke: axisLineStroke }}
          />

          {!isEmpty && <Tooltip content={<CustomTooltip />} />}

          {/* Reference Line at threshold in critical amber */}
          <ReferenceLine
            y={threshold}
            stroke={critColor}
            strokeDasharray="4 3"
            strokeWidth={1.2}
            label={{
              position: 'insideTopRight',
              value: `Threshold ${threshold.toFixed(2)}`,
              fill: critColor,
              fontSize: 9,
              fontFamily: 'monospace',
            }}
          />

          {/* Genuine Monotone Curved Spline on Real Telemetry Data Only */}
          {!isEmpty && (
            <Area
              type="monotone"
              dataKey="score"
              stroke={lineStroke}
              strokeWidth={2}
              fill="url(#threatAreaGrad)"
              isAnimationActive={false}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (!payload || payload.isAnchor) return null;
                const isCrit = payload.score >= threshold || payload.lane === 'critical';
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={isCrit ? 4.5 : 3.5}
                    fill={isCrit ? critColor : (isDark ? '#5eead4' : '#0d9488')}
                    stroke={isDark ? '#1a1410' : '#f0e8dc'}
                    strokeWidth={1.5}
                  />
                );
              }}
              activeDot={{
                r: 5.5,
                stroke: critColor,
                strokeWidth: 2,
                fill: isDark ? '#f0e8dc' : '#2a2018',
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThreatHeatmap;
