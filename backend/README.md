# Clinic Token Booking System - Backend

FastAPI backend for a First-Come-First-Served (FCFS) token booking system.

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `backend` directory with your Supabase credentials:
    ```
    SUPABASE_URL=your_project_url
    SUPABASE_KEY=your_anon_key
    ```

3.  **Run Application**:
    ```bash
    uvicorn app.main:app --reload
    ```
    API will be available at `http://localhost:8000`.
    Swagger UI: `http://localhost:8000/docs`.

## Testing

Run the verification scripts to test core logic:

*   **FCFS Logic**: `python tests/verify_fcfs.py` (Checks for duplicate tokens under load)
*   **Leave Logic**: `python tests/verify_leave.py` (Checks auto-cancellation)

## API Overview

*   **Patient**: `/patient/book-token`, `/patient/token-status`
*   **Staff**: `/staff/opd-sessions`, `/staff/queue`, `/staff/action/*` (Requires `X-Role: staff` header)
*   **System**: `/system/health`, `/system/availability`
