from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Clinic Token Booking System",
    description="Hackathon MVP for FCFS Token Booking",
    version="1.0.0"
)

# CORS (Allow all for hackathon simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import patient, staff, system, doctor

app.include_router(system.router)
app.include_router(patient.router)
app.include_router(staff.router)
app.include_router(doctor.router)

@app.get("/")
async def root():
    return {"message": "Clinic Token Booking System API is running"}
