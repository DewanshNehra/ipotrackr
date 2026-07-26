'use client';

import React from 'react';

interface SubscriptionGaugeProps {
  value: number;
  label: string;
  color: string;
  size?: number;
}

export default function SubscriptionGauge({ value, label, color, size = 80 }: SubscriptionGaugeProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Normalize against a 10x oversubscription ceiling, typical for a fully-booked IPO.
  const cappedFill = Math.min(value / 10, 1);
  const dashOffset = circumference * (1 - cappedFill);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2d2d2d"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>
            {value > 0 ? `${value.toFixed(1)}x` : '--'}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}
