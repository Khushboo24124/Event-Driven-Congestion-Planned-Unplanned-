import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';

const SEVERITY_COLOR = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#22c55e'
};

export default function TrafficMap({ incidents = [], diversionRoute = null, onSelectIncident }) {
  const defaultCenter = [12.9716, 77.5946];

  return (
    <MapContainer center={defaultCenter} zoom={12} className="z-0 h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {incidents.map((inc) => (
        <CircleMarker
          key={inc.incident_id}
          center={[inc.latitude, inc.longitude]}
          radius={12}
          fillColor={SEVERITY_COLOR[inc.severity] || '#888'}
          color="#fff"
          weight={2}
          fillOpacity={0.85}
          // Day 2 Feature: Click event capture karne ke liye
          eventHandlers={{
            click: () => {
              if (onSelectIncident) onSelectIncident(inc);
            },
          }}
        >
          <Popup>
            <div className="text-gray-900 p-1">
              <p className="font-bold text-sm border-b pb-1 mb-1">{inc.incident_id}</p>
              <p className="text-xs"><b>Severity:</b> <span style={{ color: SEVERITY_COLOR[inc.severity] }}>{inc.severity}</span></p>
              <p className="text-xs"><b>EIS Impact Score:</b> {inc.eis}/100</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {diversionRoute && (
        <Polyline positions={diversionRoute} color="#22c55e" weight={6} opacity={0.8} dashArray="10, 10" />
      )}
    </MapContainer>
  );
}