import React, { useEffect, useState } from 'react';
import TrafficMap from './components/TrafficMap';
import { getDashboard, getRoute } from './services/api';

export default function App() {
  const [data, setData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPipeline() {
      try {
        const dashboardRes = await getDashboard();
        const routeRes = await getRoute();
        setData(dashboardRes);
        setRouteData(routeRes);
      } catch (err) {
        console.error("Pipeline failure:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPipeline();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex items-center justify-center text-white font-mono tracking-widest">
        LOADING ASTraM DATA PLATFORM...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 p-5 flex flex-col justify-between z-10 shadow-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
              ASTraM COMMAND
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">VIRTUAL ENGINE ACTIVE</p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Incidents</p>
              <p className="text-3xl font-black text-red-400 mt-1">{data?.active_incidents}</p>
            </div>

            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Avg EIS</p>
              <p className="text-3xl font-black text-orange-400 mt-1">{data?.avg_eis}/100</p>
            </div>

            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personnel Deployed</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">{data?.total_personnel_deployed}</p>
            </div>
          </div>

          {routeData && (
            <div className="bg-blue-950/40 border border-blue-900/60 rounded-xl p-3.5">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></span>
                <span>Optimized Diversion</span>
              </div>
              <p className="text-xs text-gray-300">
                Strategic route calculation adds approx <span className="text-blue-400 font-bold">{routeData.estimated_extra_time_minutes} mins</span> delta overhead.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1 h-full relative bg-gray-900">
        <TrafficMap 
          incidents={data?.incidents || []} 
          diversionRoute={routeData?.diversion_path} 
        />
      </div>

    </div>
  );
}