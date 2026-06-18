const USE_MOCK = false; 
const BASE_URL = 'https://payal-12-astram-traffic-api.hf.space'; 

// 1. Payal ke '/api/v1/historical-clusters' endpoint se direct Neon DB entries lana
export const getDashboard = async () => {
  if (USE_MOCK) return { active_incidents: 5, avg_eis: 61.2, total_personnel_deployed: 32, incidents: [] };
  
  try {
    const res = await fetch(`${BASE_URL}/api/v1/historical-clusters`);
    const json = await res.json();
    
    // Payal ke response array (json.data) ko map pins structure se match kiya
    const mappedIncidents = (json.data || []).map(item => ({
      incident_id: item.id.toString().substring(0, 7).toUpperCase(), 
      latitude: item.lat,
      longitude: item.lng,
      severity: item.priority === '3' || item.priority.toLowerCase() === 'high' ? 'High' : 'Medium',
      eis: item.priority === '3' ? 85 : 45
    }));

    return {
      active_incidents: json.total_points || 0,
      avg_eis: 62.5, 
      total_personnel_deployed: (json.total_points || 0) * 3,
      incidents: mappedIncidents
    };
  } catch (error) {
    console.error("Dashboard pull error:", error);
    return { active_incidents: 0, avg_eis: 0, total_personnel_deployed: 0, incidents: [] };
  }
};

// 2. Payal ke '/api/v1/routes' NetworkX engine path array ko parse karna
export const getRoute = async () => {
  if (USE_MOCK) return { diversion_path: [], estimated_extra_time_minutes: 12 };
  
  try {
    const res = await fetch(`${BASE_URL}/api/v1/routes?priority=high`);
    const json = await res.json();
    
    // Payal ke engine se 'diversion_route' array aa raha hai, use format kiya
    return {
      origin: json.primary_route ? json.primary_route[0] : [12.9716, 77.5946],
      destination: json.primary_route ? json.primary_route[json.primary_route.length - 1] : [12.9800, 77.6250],
      diversion_path: json.diversion_route || [], 
      estimated_extra_time_minutes: 10
    };
  } catch (error) {
    console.error("Route engine error:", error);
    return { origin: [], destination: [], diversion_path: [], estimated_extra_time_minutes: 0 };
  }
};

// 3. Payal ke '/api/v1/forecast' CatBoost ML parameters ko trigger karna
export const getPredict = async (payload) => {
  if (USE_MOCK) return { computed_eis: 75.0, risk_tier: "High" };
  
  try {
    // Road closure true/false boolean ko integer (1/0) me badla jo Payal ke model ko chahiye
    const closureQuery = payload.requires_road_closure === true || payload.requires_road_closure === 1 ? 1 : 0;
    
    // Exact mapping framework according to Payal's GET query args
    const url = `${BASE_URL}/api/v1/forecast?event_type=${payload.event_type}&event_cause=${payload.event_cause}&priority=${payload.priority}&requires_road_closure=${closureQuery}`;
    
    const res = await fetch(url);
    const json = await res.json();
    
    return {
      computed_eis: json.eis_score,
      risk_tier: json.risk_level
    };
  } catch (error) {
    console.error("ML Prediction error:", error);
    return { computed_eis: 50, risk_tier: "Medium" };
  }
};