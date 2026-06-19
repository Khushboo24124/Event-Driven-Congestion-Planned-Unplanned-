import React from 'react';

const TIER_COLOR = {
  Low:      { ring: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' },
  Medium:   { ring: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c' },
  High:     { ring: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
  Critical: { ring: '#b91c1c', bg: 'rgba(185, 28, 28, 0.25)', text: '#fca5a5' },
};

function getRiskTier(eis) {
  if (eis <= 30) return 'Low';
  if (eis <= 60) return 'Medium';
  if (eis <= 80) return 'High';
  return 'Critical';
}

export default function EISGauge({ eis = 0, isRainMode = false }) {
  const tier = getRiskTier(eis);
  const color = TIER_COLOR[tier];
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (eis / 100) * circumference;

  return (
    <div className={`bg-gray-900 border ${isRainMode ? 'border-red-900/50' : 'border-gray-800'} rounded-xl p-4 flex items-center gap-4 w-full shadow-lg relative overflow-hidden transition-colors duration-500`}>
      {isRainMode && <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-xl pointer-events-none"></div>}

      <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg z-10">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="40" cy="40" r="32" fill="none"
          stroke={color.ring} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }}
        />
        <text x="40" y="36" textAnchor="middle" fontSize="22" fontWeight="700" fill="white">
          {Math.round(eis)}
        </text>
        <text x="40" y="50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#9ca3af" letterSpacing="1">EIS</text>
      </svg>
      
      <div className="z-10">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avg System EIS</p>
        <p className="text-3xl font-black text-white tracking-tight">{eis.toFixed(1)}</p>
        <span
          className="text-[10px] font-bold px-2.5 py-0.5 rounded-md inline-block mt-1.5 shadow-sm uppercase tracking-wider"
          style={{ background: color.bg, color: color.text, border: `1px solid ${color.ring}40` }}
        >
          {tier}
        </span>
      </div>
    </div>
  );
}