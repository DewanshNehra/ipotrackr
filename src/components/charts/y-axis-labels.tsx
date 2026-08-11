"use client";

import { useChartStable, useYScale } from "./chart-context";

export interface YAxisLabelsProps {
  numTicks?: number;
  format?: (value: number) => string;
  yAxisId?: string | number;
}

export function YAxisLabels({
  numTicks = 5,
  format = (v) => `₹${v}`,
  yAxisId,
}: YAxisLabelsProps) {
  const { innerHeight } = useChartStable();
  const yScale = useYScale(yAxisId);

  const ticks = yScale.ticks ? yScale.ticks(numTicks) : [];

  return (
    <g className="y-axis-labels">
      {ticks.map((tick: number) => {
        const y = yScale(tick);
        if (y == null || !Number.isFinite(y) || y < 0 || y > innerHeight) return null;
        return (
          <text
            key={tick}
            x={-8}
            y={y}
            dy="0.32em"
            textAnchor="end"
            fill="var(--chart-label, #9ca3af)"
            fontSize={11}
            fontFamily="var(--font-space-grotesk)"
          >
            {format(tick)}
          </text>
        );
      })}
    </g>
  );
}

YAxisLabels.displayName = "YAxisLabels";
