import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';

const SEVERITY_COLOR = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#22c55e'
};

export default function TrafficMap({ incidents = [], diversionRoute = null, onSelectIncident, isRainMode }) {
  const defaultCenter = [12.9716, 77.5946];
  
  // 🔀 State to handle active dashboard local diversions
  const [activeDiversionId, setActiveDiversionId] = useState(null);

  // Hardcoded real-world type coordinates offset matrix (Bengaluru simulation bypass lines)
  const generateBypassPath = (lat, lng) => {
    return [
      [lat, lng],
      [lat + 0.003, lng + 0.005],
      [lat + 0.006, lng + 0.002],
      [lat + 0.004, lng - 0.004],
      [lat, lng]
    ];
  };

  return (
    <MapContainer center={defaultCenter} zoom={12} className="z-0 h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {incidents.map((inc) => {
        // 🌧️ Dynamic Severity Factor under heavy rain simulation
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
            radius={isRainMode && effectiveSeverity === 'High' ? 15 : 12} // Rain me red icons pulsed lagte hain
            fillColor={SEVERITY_COLOR[effectiveSeverity] || '#888'}
            color={isRainMode ? "#3b82f6" : "#fff"} // Blue borders in rain mode
            weight={2}
            fillOpacity={0.85}
            eventHandlers={{
              click: () => {
                // Update parent component node telemetry panel
                if (onSelectIncident) {
                  onSelectIncident({
                    ...inc,
                    severity: effectiveSeverity,
                    eis: adjustedEis
                  });
                }
              },
            }}
          >
            <Popup>
              <div className="text-gray-900 p-1 min-w-[180px] font-sans">
                <p className="font-bold text-sm border-b pb-1 mb-1 text-slate-800">{inc.incident_id}</p>
                <p className="text-xs mt-1"><b>Cause:</b> {inc.cause || "General Breakdown"}</p>
                <p className="text-xs mt-0.5"><b>Severity:</b> <span style={{ color: SEVERITY_COLOR[effectiveSeverity], fontWeight: 'bold' }}>{effectiveSeverity}</span></p>
                <p className="text-xs mt-0.5"><b>EIS Impact Score:</b> {adjustedEis}/100</p>
                
                {/* 🔀 FEATURE 1: ROUTE DIVERSION PROTOCOL ACTION BUTTON */}
                {effectiveSeverity === 'High' && (
                  <div className="mt-2.5 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => setActiveDiversionId(activeDiversionId === inc.incident_id ? null : inc.incident_id)}
                      className={`w-full text-[10px] font-bold py-1 px-2 rounded-md transition duration-150 shadow-xs cursor-pointer ${
                        activeDiversionId === inc.incident_id 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {activeDiversionId === inc.incident_id ? '🛑 Deactivate Diversion' : '🔀 Activate Diversion'}
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Default Global API Pipeline route logic (Unchanged) */}
      {diversionRoute && !activeDiversionId && (
        <Polyline positions={diversionRoute} color="#22c55e" weight={6} opacity={0.8} dashArray="10, 10" />
      )}

      {/* 🔥 NEW FEATURE 1: DYNAMIC ALTERNATE LOCAL DIVERSION DRAW ENGINE */}
      {activeDiversionId && (() => {
        const targetIncident = incidents.find(i => i.incident_id === activeDiversionId);
        if (!targetIncident) return null;
        
        const generatedBypass = generateBypassPath(targetIncident.latitude, targetIncident.longitude);
        return (
          <Polyline 
            positions={generatedBypass} 
            color="#10b981" 
            weight={6} 
            opacity={0.9} 
            dashArray="8, 12" 
          />
        );
      })()}
    </MapContainer>
  );
}