from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.dependencies import verify_staff_role
from app.models.schemas import QueueResponse
from uuid import UUID
from datetime import date

router = APIRouter(
    prefix="/staff",
    tags=["Staff"],
    dependencies=[Depends(verify_staff_role)]
)

@router.get("/opd-sessions")
async def get_opd_sessions():
    """
    Get all active/open sessions for the staff dashboard.
    """
    try:
        response = supabase.table("opd_sessions")\
            .select("*, doctors(name)")\
            .eq("status", "OPEN")\
            .gte("date", date.today().isoformat())\
            .order("date")\
            .execute()
            
        # Enrich data if needed (e.g., count booked tokens)
        # For MVP, raw list is fine. 
        # Frontend can query counts or we can add a join/subquery if performance is needed.
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/queue/{session_id}", response_model=QueueResponse)
async def get_queue(session_id: UUID):
    """
    Get the current state of the queue for a session.
    """
    try:
        # Get Current Serving
        serving = supabase.table("tokens")\
            .select("token_number")\
            .eq("session_id", str(session_id))\
            .eq("status", "NOW_SERVING")\
            .execute()
        
        current = serving.data[0]['token_number'] if serving.data else None
        
        # Get Upcoming (BOOKED)
        upcoming_res = supabase.table("tokens")\
            .select("token_number")\
            .eq("session_id", str(session_id))\
            .eq("status", "BOOKED")\
            .order("token_number")\
            .execute()
            
        upcoming = [t['token_number'] for t in upcoming_res.data]
        
        return QueueResponse(
            session_id=session_id,
            current_token=current,
            upcoming_tokens=upcoming
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/action/serve/{token_id}")
async def serve_token(token_id: UUID):
    """
    Mark a token as NOW_SERVING (and previous one as SERVED).
    """
    try:
        supabase.rpc("serve_token", {"p_token_id": str(token_id)}).execute()
        return {"message": "Token is now being served"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/action/skip/{token_id}")
async def skip_token(token_id: UUID):
    try:
        supabase.rpc("skip_token", {"p_token_id": str(token_id)}).execute()
        return {"message": "Token skipped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/action/cancel/{token_id}")
async def cancel_token(token_id: UUID):
    try:
        supabase.rpc("cancel_token", {"p_token_id": str(token_id)}).execute()
        return {"message": "Token cancelled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
