from fastapi import APIRouter, HTTPException, Query
from app.database import supabase
from app.models.schemas import (
    TokenBookingRequest, 
    TokenBookingResponse, 
    TokenStatusResponse,
    TokenStatus
)
from datetime import date
from uuid import UUID

router = APIRouter(
    prefix="/patient",
    tags=["Patient"]
)

@router.post("/book-token", response_model=TokenBookingResponse)
async def book_token(request: TokenBookingRequest):
    """
    Book a token for the patient.
    FCFS Logic:
    1. Finds active session (if doctor_id not provided, picks first OPEN session today/tomorrow).
    2. Calls DB RPC `book_token` to ensuring atomic booking + locking.
    """
    
    # 1. Identify Session
    session_id = None
    
    try:
        if request.doctor_id:
            # Find OPEN session for this doctor
            # Prioritize today, then tomorrow
            response = supabase.table("opd_sessions")\
                .select("id")\
                .eq("doctor_id", str(request.doctor_id))\
                .eq("status", "OPEN")\
                .gte("date", date.today().isoformat())\
                .order("date")\
                .limit(1)\
                .execute()
            
            if response.data:
                session_id = response.data[0]['id']
            else:
                raise HTTPException(status_code=404, detail="No open sessions found for this doctor.")
        else:
            # Randomly pick first available OPEN session
            response = supabase.table("opd_sessions")\
                .select("id")\
                .eq("status", "OPEN")\
                .gte("date", date.today().isoformat())\
                .order("date")\
                .limit(1)\
                .execute()
                 
            if response.data:
                session_id = response.data[0]['id']
            else:
                 raise HTTPException(status_code=404, detail="No available OPD sessions at the moment.")
        
        # 2. Call RPC to Book
        # rpc('function_name', {params})
        rpc_params = {
            "p_session_id": session_id,
            "p_name": request.name,
            "p_phone": request.phone
        }
        
        rpc_response = supabase.rpc("book_token", rpc_params).execute()
        
        # If successful, it returns the token number (int)
        token_number = rpc_response.data
        
        # Calculate simplistic wait time (e.g. 5 mins per token)
        # Get queue position
        queue_response = supabase.table("tokens")\
            .select("*", count="exact")\
            .eq("session_id", session_id)\
            .in_("status", ["BOOKED", "NOW_SERVING"])\
            .lt("token_number", token_number)\
            .execute()
            
        people_ahead = queue_response.count if queue_response.count else 0
        est_wait = f"{people_ahead * 5} mins"
        
        return TokenBookingResponse(
            token_number=token_number,
            session_id=UUID(session_id),
            status=TokenStatus.BOOKED,
            estimated_wait_time=est_wait
        )
        
    except Exception as e:
        # Clean error handling
        err_msg = str(e)
        if "Session is full" in err_msg:
             raise HTTPException(status_code=400, detail="Session is full. Please try another slot.")
        if "Session not open" in err_msg:
             raise HTTPException(status_code=400, detail="Session is no longer valid.")
        
        raise HTTPException(status_code=500, detail=f"Booking failed: {err_msg}")


@router.get("/token-status/{token_number}", response_model=TokenStatusResponse)
async def get_token_status(token_number: int, session_id: UUID = Query(...)):
    """
    Check live status of a token. 
    Requires session_id because token_numbers are unique only per session.
    """
    try:
        # Get Token Details
        token_res = supabase.table("tokens")\
            .select("status, token_number")\
            .eq("session_id", str(session_id))\
            .eq("token_number", token_number)\
            .execute()
            
        if not token_res.data:
            raise HTTPException(status_code=404, detail="Token not found.")
            
        token_data = token_res.data[0]
        
        # Get Current Serving
        serving_res = supabase.table("tokens")\
            .select("token_number")\
            .eq("session_id", str(session_id))\
            .eq("status", "NOW_SERVING")\
            .execute()
            
        current_serving = serving_res.data[0]['token_number'] if serving_res.data else 0
        
        # Calculate Queue Position
        if token_data['status'] == 'BOOKED':
             queue_res = supabase.table("tokens")\
                .select("*", count="exact")\
                .eq("session_id", str(session_id))\
                .in_("status", ["BOOKED", "NOW_SERVING"])\
                .lt("token_number", token_number)\
                .execute()
             position = queue_res.count
        else:
             position = 0

        return TokenStatusResponse(
            token_number=token_data['token_number'],
            status=token_data['status'],
            current_serving_token=current_serving,
            queue_position=position
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
