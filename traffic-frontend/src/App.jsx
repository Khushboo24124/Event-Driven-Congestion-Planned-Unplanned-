import React, { useEffect, useState } from 'react';
import TrafficMap from './components/TrafficMap';
import { getDashboard, getRoute, getPredict } from './services/api';

export default function App() {
  const [data, setData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State for Live ML Prediction
  const [formData, setFormData] = useState({
    event_type: 'unplanned',
    event_cause: 'accident',
    priority: 3,
    requires_road_closure: 0
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

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

  // Handle Form Submission to Payal's CatBoost Model
  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await getPredict({
        event_type: formData.event_type,
        event_cause: formData.event_cause,
        priority: parseInt(formData.priority),
        requires_road_closure: parseInt(formData.requires_road_closure)
      });
      setPredictionResult(res);
    } catch (err) {
      console.error("ML Fetch Error:", err);
    } finally {
      setKeepState: setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex items-center justify-center text-white font-mono tracking-widest">
        LOADING ASTraM DATA PLATFORM...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden font-sans">
      
      {/* SIDEBAR PANEL */}
      <div className="w-85 bg-gray-900 border-r border-gray-800 p-5 flex flex-col space-y-6 z-10 shadow-2xl overflow-y-auto h-full">
        <div>
          <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
            ASTraM COMMAND
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">HYBRID ENGINE ACTIVE</p>
        </div>

        {/* Live System Counters */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Active Nodes</p>
            <p className="text-xl font-black text-red-400 mt-0.5">{data?.active_incidents}</p>
          </div>
          <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Avg System EIS</p>
            <p className="text-xl font-black text-orange-400 mt-0.5">{data?.avg_eis}</p>
          </div>
        </div>

        {/* INTERACTIVE NODE TELEMETRY CARD */}
        <div className="border-t border-gray-800 pt-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Node Telemetry</h2>
          {selectedIncident ? (
            <div className="bg-gray-800/80 border border-indigo-500/40 rounded-xl p-3.5 space-y-2.5 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm font-black text-indigo-400">{selectedIncident.incident_id}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  selectedIncident.severity === 'High' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-orange-950 text-orange-400 border border-orange-800'
                }`}>
                  {selectedIncident.severity}
                </span>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-2 border border-gray-800 text-center">
                <p className="text-[10px] text-gray-400 uppercase">Calculated EIS Score</p>
                <p className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400 mt-0.5">
                  {selectedIncident.eis}/100
                </p>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-gray-500 italic p-3 text-center bg-gray-900/30 border border-dashed border-gray-800 rounded-xl">
              Click map incident pins to fetch live telemetry layers.
            </div>
          )}
        </div>

        {/* NEW DAY 3 AI SIMULATOR FORM */}
        <div className="border-t border-gray-800 pt-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">AI Impact Simulator</h2>
          <form onSubmit={handlePredictSubmit} className="space-y-3 bg-gray-950/60 p-3.5 border border-gray-800 rounded-xl">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Event Type</label>
              <select 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={formData.event_type}
                onChange={(e) => setFormData({...formData, event_type: e.target.value})}
              >
                <option value="unplanned">Unplanned (Accident, Breakdown)</option>
                <option value="planned">Planned (Construction, Event)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Primary Cause</label>
              <select 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={formData.event_cause}
                onChange={(e) => setFormData({...formData, event_cause: e.target.value})}
              >
                <option value="accident">Accident</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="road_construction">Road Construction</option>
                <option value="vehicle_breakdown">Vehicle Breakdown</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Priority</label>
                <input 
                  type="number" min="1" max="5"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Closure</label>
                <select 
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  value={formData.requires_road_closure}
                  onChange={(e) => setFormData({...formData, requires_road_closure: e.target.value})}
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold p-2 rounded-lg transition duration-200 cursor-pointer shadow-md"
              disabled={predicting}
            >
              {predicting ? 'RUNNING CATBOOST CORE...' : 'RUN LIVE PREDICTION'}
            </button>

            {/* LIVE PREDICTION MODEL OUTPUT BOX */}
            {predictionResult && (
              <div className="mt-2.5 bg-indigo-950/40 border border-indigo-800/80 rounded-lg p-2 text-center animate-fadeIn">
                <p className="text-[9px] text-indigo-400 uppercase font-bold tracking-wider">CatBoost Regressor Response</p>
                <p className="text-lg font-black text-white mt-0.5">{predictionResult.computed_eis} EIS</p>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-900 text-indigo-300 uppercase mt-1 inline-block">
                  Tier: {predictionResult.risk_tier}
                </span>
              </div>
            )}
          </form>
        </div>

        {/* DIVERSION OVERHEADS */}
        {routeData && (
          <div className="bg-blue-950/40 border border-blue-900/60 rounded-xl p-3">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase mb-1">
              <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              <span>Optimized Diversion</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Delta routing overhead cost: <span className="text-blue-400 font-bold">+{routeData.estimated_extra_time_minutes} mins</span>.
            </p>
          </div>
        )}
      </div>

      {/* GEOGRAPHIC LAYER */}
      <div className="flex-1 h-full relative bg-gray-900">
        <TrafficMap 
          incidents={data?.incidents || []} 
          diversionRoute={routeData?.diversion_path}
          onSelectIncident={setSelectedIncident} 
        />
      </div>

    </div>
  );
}