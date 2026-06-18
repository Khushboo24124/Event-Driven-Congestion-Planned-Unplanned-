from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI App
app = FastAPI(title="Astram Traffic Intelligence API", version="1.0")

# Enable CORS - CRITICAL for Hackathon local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Base Route to verify server is up
@app.get("/")
def health_check():
    return {"status": "Active", "message": "Backend is running flawlessly!"}

# Endpoint 1: The Event Impact Score (EIS) Dummy Data
@app.get("/api/v1/forecast")
def get_forecast():
    return {
        "event_id": "FKID008171",
        "location": {"lat": 12.9720418, "lng": 77.6194831},
        "event_type": "unplanned",
        "cause": "vehicle_breakdown",
        "eis_score": 85,
        "risk_level": "High",
        "recommendations": {
            "manpower_required": 12,
            "barricades_needed": 25
        }
    }

# Endpoint 2: Routing / Diversion Dummy Data
@app.get("/api/v1/routes")
def get_routes():
    return {
        "primary_route": [[12.972, 77.619], [12.975, 77.620], [12.980, 77.625]],
        "diversion_route": [[12.972, 77.619], [12.970, 77.615], [12.980, 77.625]]
    }