from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import pandas as pd

# Import the calculation engine we verified yesterday
from data_engine import calculate_eis_and_resources

app = FastAPI(title="Astram Traffic Intelligence API - Production", version="2.0")

# Enable CORS for Khushboo's frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Live Neon Connection String
DATABASE_URL = "postgresql://neondb_owner:npg_3ApiysGo8vKr@ep-spring-star-aop3hmjp.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(DATABASE_URL)

@app.get("/")
def home():
    return {"status": "Online", "mode": "Production Data Engine Live"}

# 🚦 UPGRADED ENDPOINT: Dynamic calculation based on live inputs
@app.get("/api/v1/forecast")
def get_live_forecast(
    event_type: str = "unplanned",
    event_cause: str = "vehicle_breakdown",
    priority: str = "medium",
    requires_road_closure: int = 0
):
    """
    Takes dynamic parameters from frontend dropdowns, runs our rule-engine,
    and returns absolute real-time metrics.
    """
    # Run the processing engine
    calculated_data = calculate_eis_and_resources(event_type, event_cause, priority, requires_road_closure)
    
    # Mock specific coordinates near Bengaluru Center based on cause for visual effect
    coord_mapping = {
        "vehicle_breakdown": {"lat": 12.9720, "lng": 77.6194},
        "waterlogging": {"lat": 12.9556, "lng": 77.6200},
        "accident": {"lat": 12.9716, "lng": 77.5946},
        "protest": {"lat": 12.9218, "lng": 77.5750}
    }
    
    location = coord_mapping.get(event_cause.lower(), {"lat": 12.9716, "lng": 77.5946})

    return {
        "event_id": "ASTRAM-LIVE-TRG",
        "location": location,
        "event_type": event_type,
        "cause": event_cause,
        "eis_score": calculated_data["eis_score"],
        "risk_level": calculated_data["risk_level"],
        "recommendations": calculated_data["recommendations"]
    }

# 🗺️ NEW ENDPOINT: Fetch 100 historical cluster points directly from Neon DB
@app.get("/api/v1/historical-clusters")
def get_db_clusters():
    try:
        with engine.connect() as conn:
            # Query the 'incidents' table we seeded yesterday
            query = text("SELECT id, event_type, latitude, longitude, event_cause, priority FROM incidents;")
            df = pd.read_sql(query, conn)
            
            # Format output neatly into JSON for Leaflet Markers
            clusters = []
            for _, row in df.iterrows():
                clusters.append({
                    "id": str(row['id']),
                    "event_type": str(row['event_type']),
                    "cause": str(row['event_cause']),
                    "lat": float(row['latitude']),
                    "lng": float(row['longitude']),
                    "priority": str(row['priority'])
                })
            return {"status": "success", "total_points": len(clusters), "data": clusters}
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}

# Keep dynamic routing path stable
@app.get("/api/v1/routes")
def get_routes():
    return {
        "primary_route": [[12.972, 77.619], [12.975, 77.620], [12.980, 77.625]],
        "diversion_route": [[12.972, 77.619], [12.970, 77.615], [12.980, 77.625]]
    }