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
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-500/20">
            A
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
              ASTraM COMMAND
            </h1>
            <p className="text-[9px] text-gray-500 font-mono tracking-widest mt-0.5">HYBRID SMART SYSTEM</p>
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