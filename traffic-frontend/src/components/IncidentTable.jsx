import React from 'react';

const SEVERITY_DOT = {
  Low: 'bg-green-500 shadow-[0_0_8px_#22c55e]',
  Medium: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
  High: 'bg-orange-500 shadow-[0_0_8px_#f97316]',
  Critical: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
};

export default function IncidentTable({ incidents = [], onSelect, selectedId }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
        <p className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          Incident Lookup Table
        </p>
      </div>
      <div className="flex-1 overflow-y-auto max-h-87.5">
        <table className="w-full text-left border-collapse font-mono text-[11px]">
          <thead>
            <tr className="text-gray-500 uppercase text-[9px] tracking-wider bg-gray-950/40 border-b border-gray-800">
              <th className="px-4 py-2.5 font-bold">Node ID</th>
              <th className="px-4 py-2.5 font-bold">Corridor</th>
              <th className="px-4 py-2.5 font-bold text-right">EIS Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {incidents.map((inc) => (
              <tr
                key={inc.incident_id}
                onClick={() => onSelect && onSelect(inc)}
                className={`transition-colors cursor-pointer ${
                  selectedId === inc.incident_id 
                    ? 'bg-indigo-950/30 text-indigo-400' 
                    : 'hover:bg-gray-800/40 text-gray-300'
                }`}
              >
                <td className="px-4 py-3 font-bold text-white">{inc.incident_id.slice(-4)}</td>
                <td className="px-4 py-3 font-sans max-w-27.5 truncate">{inc.corridor}</td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-2 font-bold text-white">
                  <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[inc.severity] || 'bg-gray-400'}`}></span>
                  {inc.eis.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}