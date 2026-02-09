import asyncio
import httpx
import time
import random

BASE_URL = "http://localhost:8000"

async def book_token(client, name, phone):
    try:
        response = await client.post(
            f"{BASE_URL}/patient/book-token",
            json={"name": name, "phone": phone}
        )
        return response.json()
    except Exception as e:
        return {"error": str(e)}

async def main():
    print("--- Starting FCFS Verification ---")
    async with httpx.AsyncClient() as client:
        # 1. Health Check
        resp = await client.get(f"{BASE_URL}/system/health")
        if resp.status_code != 200:
            print("API is not healthy!")
            return

        print("API is up. Launching 10 concurrent booking requests...")
        
        tasks = []
        for i in range(10):
            tasks.append(book_token(client, f"User {i}", f"987654321{i}"))
        
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        end_time = time.time()
        
        print(f"Completed in {end_time - start_time:.2f} seconds.")
        
        token_numbers = []
        errors = []
        for res in results:
            if "token_number" in res:
                token_numbers.append(res['token_number'])
                print(f"Success: Token #{res['token_number']}")
            else:
                errors.append(res)
                print(f"Failed: {res}")
                
        # Verification
        if len(token_numbers) == len(set(token_numbers)):
            print("\n✅ PASSED: All token numbers are unique.")
        else:
            print("\n❌ FAILED: Duplicate token numbers detected!")
            
        print(f"Tokens booked: {sorted(token_numbers)}")

if __name__ == "__main__":
    asyncio.run(main())
