import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat'; // 🌟 Core leaflet engine injection

export default function HeatmapLayer({ points = [], visible }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !visible || points.length === 0) return;

    // Mapping coordinates dynamically with standard weights
    const heatPoints = points.map((p) => [p.latitude, p.longitude, (p.eis || 50) / 100]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      gradient: {
        0.2: '#22c55e', // Low Risk - Green
        0.5: '#f59e0b', // Medium Risk - Amber
        0.75: '#f97316', // High Risk - Orange
        1.0: '#ef4444'   // Critical - Red
      }
    });

    heatLayer.addTo(map);

    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points, visible]);

  return null;
}