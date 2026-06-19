import React from 'react';

export default function AlertBanner({ alerts = [] }) {
  const critical = alerts.filter((a) => a.severity?.toLowerCase() === 'critical');

  if (critical.length === 0) return null;

  return (
    <div className="bg-red-950/60 border border-red-900 rounded-lg px-4 py-2.5 flex items-center gap-3 mb-4 shadow-lg animate-pulse">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
      </span>
      <p className="text-xs text-red-300 font-mono tracking-wide truncate">
        <span className="font-bold text-red-400">{critical.length} CRITICAL ALERT{critical.length > 1 ? 'S' : ''} DETECTED</span>
        {' — '}{critical[0].message} at {critical[0].location}
      </p>
    </div>
  );
}