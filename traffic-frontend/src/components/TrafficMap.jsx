import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';

const SEVERITY_COLOR = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#22c55e'
};

export default function TrafficMap({ incidents = [], diversionRoute = null, onSelectIncident, isRainMode }) {
  const defaultCenter = [12.9716, 77.5946];
  
  const [activeDiversionId, setActiveDiversionId] = useState(null);
  const [realRoadPath, setRealRoadPath] = useState([]); // Asli sadak ka path store karega
  const [isRouting, setIsRouting] = useState(false); // Loading state

  // 🌍 OSRM API CALL: Asli road route nikalne ke liye
  const fetchRealRoute = async (lat, lng, incidentId) => {
    setActiveDiversionId(incidentId);
    setIsRouting(true);
    setRealRoadPath([]); // Purana route clear karo

    try {
      // Hum incident ke aas-paas 3 points banayenge bypass ke liye
      // OSRM format: Longitude, Latitude chahiye hota hai
      const startPoint = `${lng - 0.008},${lat}`; // Thoda peeche
      const viaPoint = `${lng},${lat + 0.008}`;   // Side se bypass
      const endPoint = `${lng + 0.008},${lat}`;   // Thoda aage wapas milna

      // OSRM Free API Call
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startPoint};${viaPoint};${endPoint}?geometries=geojson`);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // OSRM coordinates [lng, lat] deta hai, Leaflet ko [lat, lng] chahiye
        const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRealRoadPath(routeCoords);
      }
    } catch (error) {
      console.error("Route fetch failed:", error);
    } finally {
      setIsRouting(false);
    }
  };

  const clearDiversion = () => {
    setActiveDiversionId(null);
    setRealRoadPath([]);
  };

  return (
    <MapContainer center={defaultCenter} zoom={12} className="z-0 h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {incidents.map((inc) => {
        let effectiveSeverity = inc.severity;
        let adjustedEis = inc.eis;
        
        if (isRainMode) {
          adjustedEis = Math.min(100, inc.eis + 15);
          if (adjustedEis >= 75) effectiveSeverity = 'High';
          else if (adjustedEis >= 45) effectiveSeverity = 'Medium';
        }

        return (
          <CircleMarker
            key={inc.incident_id}
            center={[inc.latitude, inc.longitude]}
            radius={isRainMode && effectiveSeverity === 'High' ? 15 : 12}
            fillColor={SEVERITY_COLOR[effectiveSeverity] || '#888'}
            color={isRainMode ? "#3b82f6" : "#fff"}
            weight={2}
            fillOpacity={0.85}
            eventHandlers={{
              click: () => {
                if (onSelectIncident) {
                  onSelectIncident({ ...inc, severity: effectiveSeverity, eis: adjustedEis });
                }
              },
            }}
          >
            <Popup>
              <div className="text-gray-900 p-1 min-w-45 font-sans">
                <p className="font-bold text-sm border-b pb-1 mb-1 text-slate-800">{inc.incident_id}</p>
                <p className="text-xs mt-1"><b>Cause:</b> {inc.cause || "General Breakdown"}</p>
                <p className="text-xs mt-0.5"><b>Severity:</b> <span style={{ color: SEVERITY_COLOR[effectiveSeverity], fontWeight: 'bold' }}>{effectiveSeverity}</span></p>
                <p className="text-xs mt-0.5"><b>EIS Impact Score:</b> {adjustedEis}/100</p>
                
                {effectiveSeverity === 'High' && (
                  <div className="mt-2.5 pt-2 border-t border-gray-200">
                    {activeDiversionId === inc.incident_id ? (
                       <button
                         onClick={clearDiversion}
                         className="w-full text-[10px] font-bold py-1 px-2 rounded-md bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                       >
                         🛑 Clear Diversion
                       </button>
                    ) : (
                       <button
                         onClick={() => fetchRealRoute(inc.latitude, inc.longitude, inc.incident_id)}
                         disabled={isRouting}
                         className={`w-full text-[10px] font-bold py-1 px-2 rounded-md transition duration-150 shadow-xs ${isRouting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}
                       >
                         {isRouting ? '🔄 Calculating Route...' : '🔀 Activate Diversion'}
                       </button>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Global API Pipeline Route (Unchanged) */}
      {diversionRoute && !activeDiversionId && (
        <Polyline positions={diversionRoute} color="#22c55e" weight={6} opacity={0.8} dashArray="10, 10" />
      )}

      {/* 🔥 THE REAL ROAD DIVERSION PATH */}
      {activeDiversionId && realRoadPath.length > 0 && (
        <Polyline 
          positions={realRoadPath} 
          color="#10b981" 
          weight={6} 
          opacity={0.9} 
          dashArray="10, 15" 
          lineCap="round"
          lineJoin="round"
        />
      )}
    </MapContainer>
  );
}