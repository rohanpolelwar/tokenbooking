from fastapi import Header, HTTPException

async def verify_staff_role(x_role: str = Header(default=None)):
    """
    Simulates role-based access control for the Hackathon MVP.
    In a real app, this would verify a JWT claim.
    """
    if x_role != "staff":
        raise HTTPException(status_code=403, detail="Not authorized. Staff role required.")
    return x_role
