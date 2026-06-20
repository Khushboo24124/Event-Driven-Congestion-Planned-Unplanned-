import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'map', label: 'Full Map View', icon: '🗺️' },
  { id: 'commander', label: 'Commander Ops', icon: '👮‍♂️' },
  { id: 'messages', label: 'Live Notifications', icon: '💬' },
  { id: 'reports', label: 'Analytics Reports', icon: '📊' }
];

export default function Sidebar({ activeTab, setActiveTab, isRainMode, setIsRainMode, lastRefreshed }) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 p-5 flex flex-col justify-between h-full z-20 shadow-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {/* 🔥 DYNAMIC ROAD-MATRIX PULSE LOGO 🔥 */}
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="16 4 4 4" className="opacity-80" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 50 8 A 42 42 0 0 1 92 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" className="opacity-50" />
              <path d="M 15 35 Q 35 35 50 50 T 85 65" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 35 15 Q 35 35 50 50 T 65 85" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 20 50 H 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M 30 25 Q 50 15 70 25 M 30 25 V 30 M 40 21 V 30 M 50 19 V 30 M 60 21 V 30 M 70 25 V 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 50 63 C 40 53 35 45 35 39 A 8 8 0 0 1 50 34 A 8 8 0 0 1 65 39 C 65 45 60 53 50 63 Z" fill="#111827" stroke="currentColor" strokeWidth="2" />
              <path d="M 38 43 H 43 L 46 36 L 49 50 L 52 40 L 54 45 H 62" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
              EventPulse AI
            </h1>
            <p className="text-[9px] text-gray-500 font-mono tracking-widest mt-0.5 uppercase">Urban Risk Core</p>
          </div>
        </div>

        {/* Environment Simulation Switch */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Environment</span>
            <span className="text-xs text-gray-300 font-bold mt-0.5">🌧️ Heavy Rain Chaos</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isRainMode} 
              onChange={() => setIsRainMode(!isRainMode)} 
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-gray-500 after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
          </label>
        </div>

        {/* NAVIGATION LINKS */}
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">Navigation Panel</p>
        <nav className="flex flex-col space-y-1">
          {NAV_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                activeTab === tab.id 
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner' 
                  : 'text-gray-400 hover:bg-gray-800/50 border border-transparent hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sync Footer Badge */}
      <div className="text-[9px] font-mono text-gray-500 bg-gray-950/40 p-2 border border-gray-800/60 rounded-lg flex flex-col gap-0.5">
        <span className="flex items-center gap-1 font-bold text-emerald-400">
          <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping"></span>
          PIPELINE STATUS: LIVE
        </span>
        <span>Checked: {lastRefreshed.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}