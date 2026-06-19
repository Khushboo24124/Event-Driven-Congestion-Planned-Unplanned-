import React, { useState, useEffect } from 'react';

const SEVERITY_COLOR = {
  low:      { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  medium:   { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
  high:     { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
  critical: { bg: 'rgba(185, 28, 28, 0.25)', text: '#fca5a5', border: 'rgba(185, 28, 28, 0.4)' },
};

export default function IncidentCard({ incident }) {
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    setDispatched(false);
  }, [incident.incident_id]);

  const severityKey = incident.severity?.toLowerCase() || 'low';
  const color = SEVERITY_COLOR[severityKey] || SEVERITY_COLOR.low;
  
  // Dynamic formula based on AI score if backend properties are null
  const personnel = incident.personnel_count || Math.max(2, Math.ceil(incident.eis / 12) + 1);
  const barricades = incident.barricading_units || Math.max(1, Math.ceil(incident.eis / 20));

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm font-black text-white tracking-wider">{incident.incident_id}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[150px] font-mono">📍 {incident.location || 'Bengaluru Corridor'}</p>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border"
            style={{ background: color.bg, color: color.text, borderColor: color.border }}
          >
            {incident.severity} · {Math.round(incident.eis)}
          </span>
        </div>

        <p className="text-[11px] text-gray-400 bg-gray-950/40 p-2 rounded border border-gray-800/40 my-2">
          <span className="font-bold text-gray-500 uppercase text-[9px] block">Primary Cause</span>
          {incident.cause || "General System Breakdown"}
        </p>

        <div className="grid grid-cols-2 gap-4 my-4 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800/60 text-center">
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Personnel</p>
            <p className="text-xl font-black text-white mt-0.5">{personnel} Units</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Barricades</p>
            <p className="text-xl font-black text-white mt-0.5">{barricades} Units</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setDispatched(true)}
        disabled={dispatched}
        className={`w-full py-2 rounded-lg text-xs uppercase tracking-wider font-bold border transition-all duration-200 mt-2 ${
          dispatched
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 cursor-not-allowed'
            : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 cursor-pointer shadow-md'
        }`}
      >
        {dispatched ? '✓ Units Dispatched' : 'Deploy Task Force'}
      </button>
    </div>
  );
}