import React, { useEffect, useState } from 'react';
import TrafficMap from './components/TrafficMap';
import EISGauge from './components/EISGauge';
import IncidentCard from './components/IncidentCard';
import AlertBanner from './components/AlertBanner';
import { getDashboard, getRoute, getPredict } from './services/api';

// 📊 Plotly Imports
import Plot from 'react-plotly.js';
import reportsData from './mocks/reports.json';

// Helper function for Live Feed timestamp
const timeAgo = (timestamp) => {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} hr ago`;
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Existing Pipeline States
  const [data, setData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  // Day 3 States (Weather & Refresh)
  const [isRainMode, setIsRainMode] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Form State for Live ML Prediction
  const [formData, setFormData] = useState({
    event_type: 'unplanned',
    event_cause: 'accident',
    priority: 3,
    requires_road_closure: 0
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // --- Live Systemic Alerts Engine State ---
  const [liveAlerts, setLiveAlerts] = useState([
    { id: "ALT-001", incident_id: "INC-2026-0003", location: "Hebbal Flyover", severity: "Critical", eis: 88.0, message: "Critical EIS detected — immediate rerouting triggered", timestamp: new Date().toISOString() },
    { id: "ALT-002", incident_id: "INC-2026-0001", location: "MG Road Junction", severity: "High", eis: 72.5, message: "High risk incident — personnel dispatched", timestamp: new Date(Date.now() - 4 * 60000).toISOString() },
    { id: "ALT-003", incident_id: "INC-2026-0002", location: "Silk Board", severity: "Medium", eis: 45.0, message: "Medium congestion building up", timestamp: new Date(Date.now() - 12 * 60000).toISOString() }
  ]);

  // Core Pipeline Loader
  async function loadPipeline() {
    try {
      const dashboardRes = await getDashboard();
      const routeRes = await getRoute();
      setData(dashboardRes);
      setRouteData(routeRes);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Pipeline failure:", err);
    } finally {
      setLoading(false);
    }
  }

  // 10-Minute Auto Reload Engine
  useEffect(() => {
    loadPipeline();
    const interval = setInterval(() => {
      console.log("ASTraM Engine: Synchronizing background telemetry layers...");
      loadPipeline();
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  // 8-Second Live Mock Alert Generator
  useEffect(() => {
    const interval = setInterval(() => {
      const demoLocations = ['Marathahalli Bridge', 'KR Puram', 'Electronic City', 'Yeshwantpur', 'Indiranagar 100ft Road'];
      const demoSeverities = ['Low', 'Medium', 'High', 'Critical'];
      const severity = demoSeverities[Math.floor(Math.random() * demoSeverities.length)];
      
      const newAlert = {
        id: `ALT-${Date.now()}`,
        incident_id: `INC-${Math.floor(Math.random() * 9000 + 1000)}`,
        location: demoLocations[Math.floor(Math.random() * demoLocations.length)],
        severity,
        eis: Math.floor(Math.random() * 40) + (severity === 'Critical' ? 60 : 20),
        message: severity === 'Critical' 
          ? 'Critical EIS detected — immediate rerouting triggered' 
          : 'New incident logged and under monitoring',
        timestamp: new Date().toISOString()
      };
      
      setLiveAlerts((prev) => [newAlert, ...prev].slice(0, 50)); 
    }, 8000); 

    return () => clearInterval(interval);
  }, []);

  // Handle Form Submission to CatBoost Model
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
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex items-center justify-center text-white font-mono tracking-widest text-xs">
        LOADING ASTraM DATA PLATFORM...
      </div>
    );
  }

  // Derived Values for Premium Gauge Metrics
  const calculatedAvgEis = isRainMode 
    ? Math.min(99.4, ((data?.avg_eis || 57.6) + 18.4)) 
    : (data?.avg_eis || 57.6);

  const totalIncidentsCount = data?.incidents?.length || 0;
  const criticalIncidentsCount = data?.incidents?.filter(i => i.severity?.toLowerCase() === 'high' || i.severity?.toLowerCase() === 'critical').length || 0;

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden font-sans">
      
      {/* 🏛️ ENTERPRISE SIDEBAR PANEL */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-5 flex flex-col justify-between h-full z-20 shadow-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
              ASTraM COMMAND
            </h1>
            <p className="text-[9px] text-gray-500 font-mono tracking-widest mt-0.5">HYBRID SMART SYSTEM</p>
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
          <nav className="flex flex-col space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
              { id: 'map', label: 'Full Map View', icon: '🗺️' },
              { id: 'commander', label: 'Commander Ops', icon: '👮‍♂️' },
              { id: 'messages', label: 'Live Notifications', icon: '💬' },
              { id: 'reports', label: 'Analytics Reports', icon: '📊' }
            ].map((tab) => (
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

      {/* 🖥️ DYNAMIC CONTENT PANEL CONTROLLER */}
      <div className="flex-1 h-full overflow-hidden flex flex-col bg-gray-950">
        
        {/* EMERGENCY ALERT BANNER */}
        <div className="px-4 pt-4 pb-0 bg-gray-900/40">
           <AlertBanner alerts={liveAlerts} />
        </div>

        {/* TOP STAT STRIP */}
        <div className="border-b border-gray-900 bg-gray-900/40 p-4 pt-2 grid grid-cols-3 gap-4 max-h-22.5">
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Active System Nodes</p>
            <p className="text-xl font-black text-white mt-0.5">{totalIncidentsCount} Locations</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Critical Blockages</p>
            <p className="text-xl font-black text-red-400 mt-0.5">{criticalIncidentsCount} Points</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">System Stress Tier</p>
            <p className={`text-xl font-black mt-0.5 uppercase ${calculatedAvgEis >= 70 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
              {calculatedAvgEis >= 75 ? '🔥 Critical Condition' : '⚠️ Stable Loading'}
            </p>
          </div>
        </div>

        {/* VIEW CONDITIONAL RENDERING */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* 🏠 VIEW A: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="flex h-full w-full overflow-hidden">
              <div className="w-80 border-r border-gray-900 p-4 flex flex-col space-y-4 overflow-y-auto h-full bg-gray-950">
                <EISGauge eis={calculatedAvgEis} isRainMode={isRainMode} />
                
                <div className="flex-1 flex flex-col border border-gray-800 rounded-xl bg-gray-900/30 overflow-hidden">
                  <div className="bg-gray-900/70 p-2.5 border-b border-gray-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Active Incidents Stream
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-900 font-mono text-[11px]">
                    {data?.incidents?.map(inc => (
                      <div 
                        key={inc.incident_id} 
                        onClick={() => setSelectedIncident(inc)}
                        className={`p-2.5 cursor-pointer transition-colors flex justify-between items-center ${selectedIncident?.incident_id === inc.incident_id ? 'bg-indigo-950/30 text-indigo-400' : 'hover:bg-gray-900/40 text-gray-300'}`}
                      >
                        <div className="truncate max-w-37.5">
                          <span className="font-bold text-white block">{inc.incident_id}</span>
                          <span className="text-[10px] text-gray-500 block truncate">{inc.location || 'Bengaluru Axis'}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 rounded font-bold uppercase ${inc.severity?.toLowerCase() === 'high' || inc.severity?.toLowerCase() === 'critical' ? 'bg-red-950 text-red-400' : 'bg-orange-950 text-orange-400'}`}>
                          {inc.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 h-full bg-gray-900 relative">
                <TrafficMap 
                  incidents={data?.incidents || []} 
                  diversionRoute={routeData?.diversion_path}
                  onSelectIncident={setSelectedIncident} 
                  isRainMode={isRainMode}
                />
              </div>
            </div>
          )}

          {/* 🗺️ VIEW B: FULL MAP VIEW */}
          {activeTab === 'map' && (
            <div className="w-full h-full bg-gray-900 relative">
              <TrafficMap 
                incidents={data?.incidents || []} 
                diversionRoute={routeData?.diversion_path}
                onSelectIncident={setSelectedIncident} 
                isRainMode={isRainMode}
              />
              <div className="absolute top-4 right-4 z-1000 bg-gray-950/90 border border-gray-800 p-3 rounded-xl shadow-2xl max-w-50 font-mono text-[10px]">
                <p className="font-bold text-indigo-400 uppercase tracking-wider mb-1.5">Map Telemetry Layer</p>
                <p className="text-gray-400">🟢 Live Hotspots: Active</p>
                <p className="text-gray-400">🔀 OSRM Real Routing: Live</p>
                <p className="text-gray-500 text-[9px] mt-2 italic">Click pins for detailed action popups.</p>
              </div>
            </div>
          )}

          {/* 👮‍♂️ VIEW C: COMMANDER OPERATIONS */}
          {activeTab === 'commander' && (
            <div className="w-full h-full p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">AI Predictor Core</h2>
                  <form onSubmit={handlePredictSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Event Mode</label>
                      <select 
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        value={formData.event_type}
                        onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                      >
                        <option value="unplanned">Unplanned Incident</option>
                        <option value="planned">Planned Deployment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Trigger Cause</label>
                      <select 
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        value={formData.event_cause}
                        onChange={(e) => setFormData({...formData, event_cause: e.target.value})}
                      >
                        <option value="accident">Accident</option>
                        <option value="waterlogging">Waterlogging Chaos</option>
                        <option value="road_construction">Infrastructure Work</option>
                        <option value="vehicle_breakdown">Vehicle Breakdown</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Priority (1-5)</label>
                        <input 
                          type="number" min="1" max="5"
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Full Closure</label>
                        <select 
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold p-2.5 rounded-lg transition duration-200 cursor-pointer shadow-md"
                      disabled={predicting}
                    >
                      {predicting ? 'RUNNING INFERENCE...' : 'RUN LIVE CATBOOST PREDICTION'}
                    </button>
                    {predictionResult && (
                      <div className="mt-2 bg-indigo-950/30 border border-indigo-800/70 rounded-xl p-3 text-center animate-fadeIn">
                        <p className="text-[9px] text-indigo-400 uppercase font-bold tracking-wider">CatBoost Regressor Response</p>
                        <p className="text-xl font-black text-white mt-0.5">{predictionResult.computed_eis} EIS Score</p>
                        <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-bold bg-indigo-900 text-indigo-300 uppercase mt-1.5 inline-block">
                          Tier: {predictionResult.risk_tier}
                        </span>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🚨</span> Deployment Task Force Recommended Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data?.incidents?.slice(0, 6).map((inc) => (
                    <IncidentCard key={inc.incident_id} incident={inc} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 💬 VIEW D: LIVE NOTIFICATIONS (Auto-Generating Feed) */}
          {activeTab === 'messages' && (
            <div className="w-full h-full p-6 overflow-y-auto max-w-4xl mx-auto text-white">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <h1 className="text-sm font-black uppercase tracking-wider text-gray-300">Live Telemetry Alerts</h1>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] text-green-500 font-mono tracking-widest ml-auto bg-green-950/30 px-2 py-1 rounded border border-green-900/50">
                  SYSTEMIC FEED: ACTIVE
                </span>
              </div>

              <div className="flex flex-col gap-3 font-mono">
                {liveAlerts.map((alert) => {
                  const s = alert.severity?.toLowerCase();
                  const color = 
                    s === 'critical' ? { bg: 'bg-red-950/30', text: 'text-red-400', border: 'border-red-900/50', dot: 'bg-red-500' } :
                    s === 'high'     ? { bg: 'bg-orange-950/30', text: 'text-orange-400', border: 'border-orange-900/50', dot: 'bg-orange-500' } :
                    s === 'medium'   ? { bg: 'bg-amber-950/30', text: 'text-amber-400', border: 'border-amber-900/50', dot: 'bg-amber-500' } :
                                       { bg: 'bg-green-950/30', text: 'text-green-400', border: 'border-green-900/50', dot: 'bg-green-500' };

                  return (
                    <div key={alert.id} className={`${color.bg} ${color.border} border rounded-xl px-4 py-3 flex items-start gap-4 transition-all duration-500 animate-fadeIn`}>
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${color.text} ${color.dot}`}></span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className={`text-[11px] font-bold uppercase tracking-wider ${color.text}`}>
                            {alert.severity} ALERT · EIS {alert.eis}
                          </p>
                          <p className="text-[10px] text-gray-500">{timeAgo(alert.timestamp)}</p>
                        </div>
                        <p className="text-xs text-gray-300 font-sans font-medium">{alert.message}</p>
                        <p className="text-[10px] text-gray-500 mt-1.5">📍 {alert.location} <span className="mx-2">|</span> 🆔 {alert.incident_id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 📊 VIEW E: ANALYTICS REPORTS (WITH PLOTLY) */}
          {activeTab === 'reports' && (
            <div className="w-full h-full p-6 overflow-y-auto space-y-6 max-w-6xl mx-auto">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>📊</span> Post-Event Analytics & Learning (FR-8)
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Corridor breakdown - Bar chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Incidents by Corridor</p>
                  <Plot
                    data={[{
                      x: reportsData.corridor_breakdown.map(d => d.corridor),
                      y: reportsData.corridor_breakdown.map(d => d.incidents),
                      type: 'bar',
                      marker: { color: '#6366f1' } 
                    }]}
                    layout={{
                      autosize: true,
                      height: 250,
                      margin: { t: 10, l: 30, r: 10, b: 30 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#9ca3af', size: 10 },
                      xaxis: { gridcolor: '#1f2937' },
                      yaxis: { gridcolor: '#1f2937' }
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* EIS trend - Line chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">EIS Trend (Last 6 Days)</p>
                  <Plot
                    data={[{
                      x: reportsData.eis_trend.map(d => d.date),
                      y: reportsData.eis_trend.map(d => d.avg_eis),
                      type: 'scatter',
                      mode: 'lines+markers',
                      line: { color: '#f59e0b', width: 3 }, 
                      marker: { color: '#f59e0b', size: 8 }
                    }]}
                    layout={{
                      autosize: true,
                      height: 250,
                      margin: { t: 10, l: 30, r: 10, b: 30 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#9ca3af', size: 10 },
                      xaxis: { gridcolor: '#1f2937' },
                      yaxis: { gridcolor: '#1f2937' }
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Severity distribution - Pie chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:col-span-2 shadow-lg flex flex-col items-center">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 w-full text-left">Severity Distribution (Monthly)</p>
                  <Plot
                    data={[{
                      labels: reportsData.severity_distribution.map(d => d.severity),
                      values: reportsData.severity_distribution.map(d => d.count),
                      type: 'pie',
                      hole: 0.4, 
                      marker: { colors: ['#22c55e', '#f97316', '#ef4444', '#b91c1c'] },
                      textinfo: 'label+percent',
                      textfont: { color: '#fff', size: 11 }
                    }]}
                    layout={{
                      autosize: true,
                      height: 300,
                      margin: { t: 10, l: 10, r: 10, b: 10 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      showlegend: true,
                      legend: { font: { color: '#9ca3af' }, orientation: 'h', y: -0.1 }
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%', maxWidth: '500px' }}
                  />
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}