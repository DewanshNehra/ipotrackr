'use client';

import React, { useEffect, useState } from 'react';
import { fetchIPOGmpData } from '@/lib/api';
import { GmpHistoryItem } from '@/types/ipo';
import { AreaChart } from '@/components/charts/area-chart';
import { Area } from '@/components/charts/area';

interface SparklineProps {
  ipoId: number;
  /** Height of the chart in px. Width fills the container. */
  height?: number;
  /** Extra classes for the outer flex wrapper. */
  className?: string;
}

export default function Sparkline({ ipoId, height = 40, className }: SparklineProps) {
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchIPOGmpData(ipoId)
      .then((history: GmpHistoryItem[]) => {
        if (cancelled) return;
        const values = history.map(h => h.gmp);
        setData(values.length > 12 ? values.slice(-12) : values);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ipoId]);

  const hasSpark = data.length >= 2;

  // Synthetic evenly-spaced dates keep the bklit time scale happy — only the
  // shape matters for a spark, not the actual calendar spacing.
  const chartData = data.map((gmp, index) => ({
    date: new Date(2026, 0, index + 1),
    gmp,
  }));

  const up = hasSpark ? data[data.length - 1] >= data[0] : true;
  const color = up ? '#00FF7B' : '#FF3F42';
  const pct = hasSpark && data[0] !== 0
    ? ((data[data.length - 1] - data[0]) / Math.abs(data[0])) * 100
    : 0;

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <div className="flex-1 min-w-0" style={{ height }}>
        {hasSpark && (
          <AreaChart
            data={chartData}
            xDataKey="date"
            margin={{ top: 4, right: 2, bottom: 4, left: 2 }}
            className="h-full w-full"
            animationDuration={800}
            status="ready"
          >
            <Area
              dataKey="gmp"
              fill={color}
              stroke={color}
              fillOpacity={0.25}
              gradientToOpacity={0}
              strokeWidth={2}
              showHighlight={false}
            />
          </AreaChart>
        )}
      </div>
      {hasSpark ? (
        <span
          className="text-[11px] font-semibold tabular-nums leading-none shrink-0"
          style={{ color }}
        >
          {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
        </span>
      ) : (
        !loading && (
          <span className="text-[11px] text-[#5D5D5D] shrink-0">No trend yet</span>
        )
      )}
    </div>
  );
}
