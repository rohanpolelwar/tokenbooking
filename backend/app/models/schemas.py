from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import date, time, datetime
from enum import Enum

# Enums matching DB
class SessionStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"

class TokenStatus(str, Enum):
    BOOKED = "BOOKED"
    NOW_SERVING = "NOW_SERVING"
    SERVED = "SERVED"
    SKIPPED = "SKIPPED"
    CANCELLED = "CANCELLED"

class LeaveType(str, Enum):
    PLANNED = "PLANNED"
    UNPLANNED = "UNPLANNED"

# --- Patient Models ---

class TokenBookingRequest(BaseModel):
    doctor_id: Optional[UUID] = None # Optional, if not provided will pick the first available or specific logic
    name: str
    phone: str

class TokenBookingResponse(BaseModel):
    token_number: int
    session_id: UUID
    status: TokenStatus
    estimated_wait_time: str # Simplified for MVP, e.g. "15 mins"

class TokenStatusResponse(BaseModel):
    token_number: int
    status: TokenStatus
    current_serving_token: int
    queue_position: int

# --- Staff Models ---

class OPDSessionResponse(BaseModel):
    id: UUID
    doctor_name: str
    date: date
    start_time: time
    end_time: time
    max_tokens: int
    status: SessionStatus
    tokens_booked: int

class QueueResponse(BaseModel):
    session_id: UUID
    current_token: Optional[int]
    upcoming_tokens: List[int]

# --- Leave Models ---

class LeaveRequest(BaseModel):
    doctor_id: UUID
    leave_date: date
    type: LeaveType
    reason: Optional[str] = None
