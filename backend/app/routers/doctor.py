from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.dependencies import verify_staff_role
from app.models.schemas import LeaveRequest

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"],
    dependencies=[Depends(verify_staff_role)] # Assuming staff manages doctor leaves too
)

@router.post("/leave")
async def declare_leave(request: LeaveRequest):
    """
    Declare leave for a doctor.
    - If PLANNED: Blocks future sessions.
    - If UNPLANNED + TODAY: Auto-cancels today's sessions and tokens via DB Trigger.
    """
    try:
        # Insert into doctor_leaves
        # The DB triggers 'trg_unplanned_leave' and 'trg_block_session_on_leave' handle the logic.
        
        data = {
            "doctor_id": str(request.doctor_id),
            "leave_date": request.leave_date.isoformat(),
            "type": request.type.value,
            "reason": request.reason
        }
        
        response = supabase.table("doctor_leaves").insert(data).execute()
        
        if request.leave_date.isoformat() == date.today().isoformat() and request.type == "UNPLANNED":
             return {"message": "Unplanned leave declared. Today's sessions and tokens have been auto-cancelled."}
        
        return {"message": "Leave declared successfully."}
        
    except Exception as e:
        # Check for trigger errors
        if "Cannot create or open session" in str(e):
             raise HTTPException(status_code=400, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
