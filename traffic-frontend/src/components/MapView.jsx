import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';

export default function MapView({ incidents = [], selectedIncident, onSelectIncident }) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  
  // 🧠 SMART STATE
  const [activeDiversionId, setActiveDiversionId] = useState(null);
  const [liveRouteCoords, setLiveRouteCoords] = useState(null); // Asli sadko ke coordinates
  const [isLoadingRoute, setIsLoadingRoute] = useState(false); // Button Loading state

  // Guard: Deselect par route reset ho jaye
  useEffect(() => {
    if (!selectedIncident) {
      setActiveDiversionId(null);
      setLiveRouteCoords(null);
    }
  }, [selectedIncident]);

  // 🗺️ 100% REAL ROAD ROUTING ENGINE (Using OSRM API)
  const fetchRoadSnappedRoute = async (incident) => {
    try {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);

      // Unique id ke base par bypass ke waypoints (takki har incident ka rasta alag bane)
      const idSeed = parseInt(incident.incident_id.replace(/\D/g, '')) || 1;
      
      // Point 1: Incident Location
      const p1 = `${lng},${lat}`;
      // Point 2: Ek diversion gali ya road
      const p2 = `${lng + ((idSeed % 2 === 0 ? 1 : -1) * 0.005)},${lat + 0.005}`;
      // Point 3: Wapas main road par aana
      const p3 = `${lng + ((idSeed % 3 === 0 ? 1 : -1) * 0.008)},${lat - 0.002}`;

      // OSRM Public API (Live sadko ka data mangwata hai)
      const url = `https://router.project-osrm.org/route/v1/driving/${p1};${p2};${p3}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        // OSRM coordinates ko [lng, lat] mein deta hai, Leaflet ko [lat, lng] chahiye
        const roadSnappedPath = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        return roadSnappedPath;
      }
    } catch (error) {
      console.error("Routing engine failed to fetch real roads:", error);
    }
    return null;
  };

  const handleToggleDiversion = async (e, inc) => {
    e.stopPropagation();

    // Agar pehle se ON hai, toh usko OFF kar do
    if (activeDiversionId === inc.incident_id) {
      setActiveDiversionId(null);
      setLiveRouteCoords(null);
      return;
    }

    // ON karne ka process (Live API call)
    setActiveDiversionId(inc.incident_id);
    setIsLoadingRoute(true);
    
    const realRoadCoords = await fetchRoadSnappedRoute(inc);
    
    if (realRoadCoords) {
      setLiveRouteCoords(realRoadCoords);
    } else {
      alert("⚠️ Routing Server Error: Could not generate road-snapped route.");
      setActiveDiversionId(null);
    }
    
    setIsLoadingRoute(false);
  };

  return (
    <div className="h-full w-full relative bg-gray-950">
      
      {/* 🎛️ CLEAN LAYER CONTROLS */}
      <div className="absolute top-4 right-4 z-1000 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-2xl font-sans min-w-40">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Map Visualization</p>
        <div className="flex flex-col space-y-2">
          {[
            { id: 'heat', label: '📊 Heatmap Layer', checked: showHeatmap, change: setShowHeatmap },
            { id: 'mark', label: '📍 Core Incidents', checked: showMarkers, change: setShowMarkers }
          ].map((layer) => (
            <label key={layer.id} className="flex items-center gap-2.5 text-xs text-gray-200 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" checked={layer.checked} onChange={() => layer.change(!layer.checked)} className="rounded border-gray-800 text-indigo-600 focus:ring-0 accent-indigo-500 h-3.5 w-3.5 bg-gray-950" />
              <span className="font-medium">{layer.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 🧭 PREMIUM RISK LEGEND */}
      <div className="absolute bottom-6 left-6 z-1000 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl p-3 flex flex-col gap-2 shadow-2xl font-mono text-[10px]">
        <p className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-0.5 border-b border-gray-800 pb-1">Stress Levels</p>
        <div className="flex items-center gap-2 text-gray-300 font-bold"><span className="w-2 h-2 rounded-full bg-[#22c55e]"></span><span>Low</span></div>
        <div className="flex items-center gap-2 text-gray-300 font-bold"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span><span>Medium</span></div>
        <div className="flex items-center gap-2 text-gray-300 font-bold"><span className="w-2 h-2 rounded-full bg-[#f97316]"></span><span>High</span></div>
        <div className="flex items-center gap-2 text-gray-300 font-bold"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span><span>Critical</span></div>
      </div>

      <MapContainer center={[12.9716, 77.5946]} zoom={12} className="h-full w-full z-10" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

        <HeatmapLayer points={incidents} visible={showHeatmap} />

        {/* 🛣️ LIVE ROAD-SNAPPED DIVERSION RENDERER */}
        {liveRouteCoords && (
          <>
            <Polyline positions={liveRouteCoords} color="#4f46e5" weight={8} opacity={0.35} lineCap="round" lineJoin="round" />
            <Polyline positions={liveRouteCoords} color="#ffffff" weight={3} opacity={0.9} dashArray="10, 12" className="animate-pulse" lineCap="round" lineJoin="round" />
          </>
        )}

        {/* 📍 INCIDENT NODES INTERACTION LOOP */}
        {showMarkers && incidents.map((inc) => {
          const isSelected = selectedIncident?.incident_id === inc.incident_id;
          const isThisRouteActive = activeDiversionId === inc.incident_id;

          return (
            <CircleMarker
              key={inc.incident_id}
              center={[inc.latitude, inc.longitude]}
              radius={isSelected ? 13 : 9}
              pathOptions={{ 
                fillColor: inc.hexColor || '#6b7280', 
                color: '#ffffff', 
                weight: isSelected ? 3.5 : 2, 
                fillOpacity: 0.95 
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectIncident) onSelectIncident(inc);
                  // Jab naya pin click ho toh purana route hat jaye
                  if(activeDiversionId !== inc.incident_id) {
                    setActiveDiversionId(null);
                    setLiveRouteCoords(null);
                  }
                },
              }}
            >
              <Popup>
                <div className="font-sans text-xs space-y-2 p-0.5 min-w-37.5">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1 gap-4">
                    <span className="font-mono font-bold text-gray-900">{inc.incident_id}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase text-white shadow-sm" style={{ backgroundColor: inc.hexColor || '#6b7280' }}>
                      {inc.severity}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 font-semibold">📍 {inc.location || inc.corridor || 'Bengaluru Corridor'}</p>
                  
                  <div className="bg-gray-50 p-1.5 rounded text-center border border-gray-100">
                    <span className="text-[8px] text-gray-400 uppercase block font-bold tracking-wider">EIS Node Score</span>
                    <span className="text-sm font-black text-gray-900">{Number(inc.eis).toFixed(1)}</span>
                  </div>

                  {/* ⚡ THE REAL-TIME ACTIVATION BUTTON */}
                  <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Diversion Route</span>
                    <button
                      type="button"
                      disabled={isLoadingRoute && activeDiversionId === inc.incident_id}
                      onClick={(e) => handleToggleDiversion(e, inc)}
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded transition-all cursor-pointer select-none shadow-sm ${
                        isThisRouteActive 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isLoadingRoute && activeDiversionId === inc.incident_id 
                        ? 'LOADING...' 
                        : (isThisRouteActive ? 'TURN OFF 🛑' : 'ACTIVATE 🛣️')}
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}