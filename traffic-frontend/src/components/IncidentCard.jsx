import React from 'react';

const SEVERITY_COLOR = {
  Low:      { badge: 'bg-green-950/60 text-green-400 border-green-900', bar: 'bg-green-500' },
  Medium:   { badge: 'bg-amber-950/60 text-amber-400 border-amber-900', bar: 'bg-amber-500' },
  High:     { badge: 'bg-orange-950/60 text-orange-400 border-orange-900', bar: 'bg-orange-500' },
  Critical: { badge: 'bg-red-950/60 text-red-400 border-red-900', bar: 'bg-red-500' },
};

export default function IncidentCard({ incident, onDispatch }) {
  const color = SEVERITY_COLOR[incident.severity] || SEVERITY_COLOR.Low;

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
      {/* Top indicator strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${color.bar}`} />

      <div className="pt-1">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm font-black text-white tracking-wider">{incident.incident_id}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-sans">📍 {incident.location}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${color.badge}`}>
            {incident.severity} · {incident.eis}
          </span>
        </div>

        <p className="text-[10px] text-gray-500 bg-gray-950/40 p-2 rounded border border-gray-800/40 my-2 font-mono">
          <span className="font-bold text-gray-600 block uppercase text-[8px]">Flagged Reason</span>
          {incident.cause || "System Congestion Anomaly"}
        </p>

        <div className="grid grid-cols-3 gap-2 my-4 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800/60 text-center font-mono">
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase">Personnel</p>
            <p className="text-base font-black text-white mt-0.5">{incident.personnel_count}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase">Barricades</p>
            <p className="text-base font-black text-white mt-0.5">{incident.barricading_units}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase">Closure</p>
            <p className="text-[11px] font-black text-indigo-400 uppercase mt-1 truncate">{incident.closure_status}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDispatch && onDispatch(incident.incident_id)}
        disabled={incident.dispatched}
        className={`w-full py-2 rounded-lg text-xs uppercase tracking-wider font-bold border transition-all duration-200 mt-2 ${
          incident.dispatched
            ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400 cursor-default'
            : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 cursor-pointer shadow-md'
        }`}
      >
        {incident.dispatched ? '✓ Units Dispatched' : 'Deploy Task Force'}
      </button>
    </div>
  );
}