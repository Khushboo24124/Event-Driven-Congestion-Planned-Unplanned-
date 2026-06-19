import React from 'react';
import { Polyline, Popup } from 'react-leaflet';

export default function RouteOverlay({ routes = [], visible }) {
  if (!visible) return null;

  return (
    <>
      {routes.map((route, idx) => (
        <Polyline
          key={`${route.incident_id}-${idx}`}
          positions={route.path}
          pathOptions={{
            color: '#3b82f6', // Premium Indigo-Blue active routing paths
            weight: 4,
            dashArray: '8, 8', // Flawless dashed active layout
            lineCap: 'round'
          }}
        >
          <Popup>
            <div className="font-sans text-xs">
              <p className="font-bold text-blue-500">Active Diversion Matrix</p>
              <p className="text-gray-500 mt-0.5">Assigned Node: {route.incident_id}</p>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
}