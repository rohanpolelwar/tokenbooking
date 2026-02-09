from fastapi import APIRouter, Depends, HTTPException
from app.database import supabase
from datetime import date

router = APIRouter(
    prefix="/system",
    tags=["System"]
)

@router.get("/health")
async def health_check():
    """
    Simple health check for the API.
    """
    return {"status": "ok", "message": "Service is healthy"}

@router.get("/availability")
async def check_availability():
    """
    Check if there are any OPEN OPD sessions for today.
    """
    today = date.today().isoformat()
    
    try:
        # distinct count of open sessions today
        response = supabase.table("opd_sessions")\
            .select("id, doctor_id, status")\
            .eq("date", today)\
            .eq("status", "OPEN")\
            .execute()
            
        if response.data:
            return {
                "available": True, 
                "open_sessions": len(response.data),
                "message": "OPD is currently open."
            }
        else:
             return {
                "available": False, 
                "open_sessions": 0,
                "message": "No OPD sessions are currently open."
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
