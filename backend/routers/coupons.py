from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
import os
import random
import string
from supabase import create_client, Client
from datetime import datetime

router = APIRouter(prefix="/api/coupons", tags=["coupons"])

# Initialize Supabase Client (Verify env vars exist in your setup)
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") # Reusing frontend env var name if shared, or use specific
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # We need service role to deduct points safely

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: Supabase credentials not found in env. Backend logic involving DB will fail.")

def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Database configuration error")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Models
class RedeemRequest(BaseModel):
    user_id: str
    points_to_redeem: int

class CouponResponse(BaseModel):
    id: str
    code: str
    points_used: int
    value_rupees: int
    status: str
    created_at: str

class ParkResponse(BaseModel):
    id: str
    name: str
    city: str
    state: str
    ticket_price: int
    description: Optional[str]
    is_active: bool

class TicketRedeemRequest(BaseModel):
    user_id: str
    park_id: str
    coupon_code: str

class TicketResponse(BaseModel):
    id: str
    park_name: str
    ticket_status: str
    issued_at: str
    coupon_code: str

# Helper: Generate Coupon Code
def generate_coupon_code() -> str:
    # Format: AQW-XXXX-XXXX
    # 4 chars from uppercase + digits
    def segment():
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    return f"AQW-{segment()}-{segment()}"

# Helper: Mock Email Notification
def send_email_notification(email: str, coupon_code: str, value: int):
    print(f"==========================================")
    print(f"EMAIL SENT TO: {email}")
    print(f"Subject: Your AquaWatch Reward Coupon!")
    print(f"Here is your coupon code: {coupon_code} (Value: ₹{value})")
    print(f"==========================================")

# Endpoints
@router.post("/redeem", response_model=CouponResponse)
def redeem_points(request: RedeemRequest, supabase: Client = Depends(get_supabase)):
    # 1. Check User Balance
    user_res = supabase.table("profiles").select("wallet_balance, id, full_name").eq("id", request.user_id).single().execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_balance = user_res.data.get("wallet_balance", 0)
    
    if current_balance < request.points_to_redeem:
        raise HTTPException(status_code=400, detail="Insufficient points")
    
    if request.points_to_redeem <= 0:
        raise HTTPException(status_code=400, detail="Points must be greater than 0")

    # 2. Conversion Logic
    value_rupees = request.points_to_redeem * 10
    
    # 3. Generate Code
    code = generate_coupon_code()
    # Ensure uniqueness (simple retry logic could be added here, but relying on low collision for now)
    
    # 4. Atomic Transaction ?? 
    # Supabase-py doesn't strictly support "transactions" in the same way as SQLAlchemy session.
    # We will do: Deduct Points -> Create Coupon. If Coupon fails, we manually Revert points (optimistic).
    # Ideally should use an RPC function in Postgres for atomicity.
    
    try:
        # Deduct Points
        new_balance = current_balance - request.points_to_redeem
        supabase.table("profiles").update({"wallet_balance": new_balance}).eq("id", request.user_id).execute()
        
        # Create Coupon
        coupon_data = {
            "user_id": request.user_id,
            "code": code,
            "points_used": request.points_to_redeem,
            "value_rupees": value_rupees,
            "status": "active"
        }
        res = supabase.table("coupon_codes").insert(coupon_data).execute()
        created_coupon = res.data[0]
        
        # 5. Email
        # In a real scenario we fetch email from auth.users or profiles if stored there
        # For now, mocking with "user@example.com" or fetching if available
        send_email_notification(f"user_{request.user_id}@aquawatch.com", code, value_rupees)
        
        return created_coupon

    except Exception as e:
        print(f"Error during redemption: {e}")
        # Attempt rollback if points were deducted? 
        # For this demo, raising 500.
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-coupons/{user_id}", response_model=List[CouponResponse])
def get_my_coupons(user_id: str, supabase: Client = Depends(get_supabase)):
    res = supabase.table("coupon_codes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return res.data

@router.get("/parks", response_model=List[ParkResponse])
def get_parks(supabase: Client = Depends(get_supabase)):
    res = supabase.table("parks_gardens").select("*").eq("is_active", True).execute()
    return res.data

@router.post("/parks/redeem-ticket", response_model=TicketResponse)
def redeem_park_ticket(request: TicketRedeemRequest, supabase: Client = Depends(get_supabase)):
    # 1. Fetch Coupon
    coupon_res = supabase.table("coupon_codes").select("*").eq("code", request.coupon_code).eq("user_id", request.user_id).execute()
    if not coupon_res.data:
        raise HTTPException(status_code=404, detail="Invalid Coupon Code")
    
    coupon = coupon_res.data[0]
    
    if coupon['status'] != 'active':
        raise HTTPException(status_code=400, detail="Coupon is already used or expired")

    # 2. Fetch Park
    park_res = supabase.table("parks_gardens").select("*").eq("id", request.park_id).single().execute()
    if not park_res.data:
        raise HTTPException(status_code=404, detail="Park not found")
    
    park = park_res.data
    
    # 3. Validate Value
    if coupon['value_rupees'] < park['ticket_price']:
        raise HTTPException(status_code=400, detail=f"Insufficient Coupon Value (₹{coupon['value_rupees']}). Ticket requires ₹{park['ticket_price']}")

    # 4. Atomic Redemption (Optimistic)
    try:
        # Mark Coupon Redeemed
        update_res = supabase.table("coupon_codes").update({
            "status": "redeemed",
            "redeemed_at": datetime.utcnow().isoformat()
        }).eq("id", coupon['id']).execute()
        
        # Create Ticket
        ticket_data = {
            "user_id": request.user_id,
            "park_id": request.park_id,
            "coupon_code_id": coupon['id'],
            "ticket_status": "valid"
        }
        ticket_res = supabase.table("park_tickets").insert(ticket_data).execute()
        ticket = ticket_res.data[0]
        
        return {
            "id": ticket['id'],
            "park_name": park['name'],
            "ticket_status": ticket['ticket_status'],
            "issued_at": ticket['issued_at'],
            "coupon_code": coupon['code']
        }

    except Exception as e:
        print(e)
        # In real world, we might need manual rollback here if coupon updated but ticket failed.
        # supabase.table("coupon_codes").update({"status": "active", "redeemed_at": None}).eq("id", coupon['id']).execute()
        raise HTTPException(status_code=500, detail="Transaction failed. Please contact support.")
