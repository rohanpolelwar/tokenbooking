import httpx
import datetime

BASE_URL = "http://localhost:8000"

def verify_leave():
    print("--- Starting Leave Management Verification ---")
    
    # 1. Book a token to ensure session is active
    print("Booking a test token...")
    resp = httpx.post(
        f"{BASE_URL}/patient/book-token",
        json={"name": "Leave Test User", "phone": "0000000000"}
    )
    if resp.status_code != 200:
        print(f"Setup failed: Could not book token. {resp.text}")
        return

    token_data = resp.json()
    print(f"Booked Token #{token_data['token_number']} on Session {token_data['session_id']}")
    
    # 2. Declare Unplanned Leave for Today (Simulating emergency)
    # We need a doctor ID. Ideally we get this from the session, but for now we'll fetch sessions.
    
    sessions_resp = httpx.get(f"{BASE_URL}/staff/opd-sessions", headers={"X-Role": "staff"})
    if not sessions_resp.json():
         print("No sessions found to cancel.")
         return
         
    session = sessions_resp.json()[0]
    doctor_id = session['doctor_id']
    
    print(f"\nDeclaring Unplanned Leave for Doctor {doctor_id} for TODAY...")
    
    leave_payload = {
        "doctor_id": doctor_id,
        "leave_date": datetime.date.today().isoformat(),
        "type": "UNPLANNED",
        "reason": "Emergency Test"
    }
    
    leave_resp = httpx.post(
        f"{BASE_URL}/doctor/leave",
        headers={"X-Role": "staff"},
        json=leave_payload
    )
    
    print(f"Leave Response: {leave_resp.json()}")
    
    # 3. Verify Token Status
    print("\nVerifying Token Status (Expect CANCELLED)...")
    status_resp = httpx.get(
        f"{BASE_URL}/patient/token-status/{token_data['token_number']}?session_id={token_data['session_id']}"
    )
    
    final_status = status_resp.json()['status']
    print(f"Token Status: {final_status}")
    
    if final_status == "CANCELLED":
        print("✅ PASSED: Token was auto-cancelled.")
    else:
        print(f"❌ FAILED: Token status is {final_status}")

if __name__ == "__main__":
    verify_leave()
