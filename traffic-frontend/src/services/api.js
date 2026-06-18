const USE_MOCK = false; 
const BASE_URL = 'https://payal-12-astram-traffic-api.hf.space'; 

// 1. Neon PostgreSQL Database se real data points pull karne ke liye
export const getDashboard = async () => {
  if (USE_MOCK) {
    return { active_incidents: 5, avg_eis: 61.2, total_personnel_deployed: 32, incidents: [] };
  }
  const res = await fetch(`${BASE_URL}/api/v1/historical-clusters`);
  const json = await res.json();
  
  // Database ke data ko tumhare map pins ke layout se match karne ke liye mapping
  const mappedIncidents = (json.data || []).map(item => ({
    incident_id: item.id.substring(0, 7).toUpperCase(), 
    latitude: item.lat,
    longitude: item.lng,
    severity: item.priority === '3' || item.priority.toLowerCase() === 'high' ? 'High' : 'Medium',
    eis: item.priority === '3' ? 85 : 45
  }));

  return {
    active_incidents: json.total_points || 0,
    avg_eis: 64.8, 
    total_personnel_deployed: (json.total_points || 0) * 4,
    incidents: mappedIncidents
  };
};

// 2. NetworkX graph se generated path lanes lane ke liye
export const getRoute = async () => {
  if (USE_MOCK) return { diversion_path: [], estimated_extra_time_minutes: 12 };
  
  // Payal ka real endpoint /api/v1/routes (with 's')
  const res = await fetch(`${BASE_URL}/api/v1/routes?priority=medium`);
  const json = await res.json();
  
  return {
    origin: json.origin || [12.9716, 77.5946],
    destination: json.destination || [12.9352, 77.6245],
    diversion_path: json.diversion_path || [],
    estimated_extra_time_minutes: json.estimated_extra_time_minutes || 10
  };
};

// 3. Payal ke CatBoost ML Model ko Form details bhej kar live score calculate karne ke liye
export const getPredict = async (payload) => {
  if (USE_MOCK) return { computed_eis: 75.0, risk_tier: "High" };
  
  // Form data ko Payal ke GET query parameters me convert kiya
  const url = `${BASE_URL}/api/v1/forecast?event_type=${payload.event_type}&event_cause=${payload.event_cause}&priority=${payload.priority === 3 ? 'high' : 'medium'}&requires_road_closure=${payload.requires_road_closure}`;
  
  const res = await fetch(url);
  const json = await res.json();
  
  return {
    computed_eis: json.eis_score,
    risk_tier: json.risk_level
  };
};