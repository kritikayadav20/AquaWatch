from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime

load_dotenv()

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

# Supabase Setup
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role for Admin Access logic if needed
supabase: Client = create_client(url, key)

@router.get("/severity")
async def get_severity_by_area():
    """
    Returns areas (approximated by rounded coordinates) with highest average infestation.
    """
    try:
        response = supabase.table("submissions").select("*").execute()
        data = response.data
        
        # Group by "Area" (Round Lat/Long to 2 decimal places ~1km)
        area_groups = defaultdict(list)
        for sub in data:
            if sub.get('latitude') and sub.get('longitude') and sub.get('coverage_percent'):
                lat = round(sub['latitude'], 2)
                lon = round(sub['longitude'], 2)
                area_name = f"Area {lat}, {lon}" # Simplified Name
                area_groups[area_name].append(sub['coverage_percent'])

        # Calculate Average
        results = []
        for area, coverages in area_groups.items():
            avg = sum(coverages) / len(coverages)
            results.append({"name": area, "severity": round(avg, 1)})
        
        # Sort desc
        results.sort(key=lambda x: x['severity'], reverse=True)
        return results[:10] # Top 10
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trend")
async def get_infestation_trend():
    """
    Returns daily average infestation over time.
    """
    try:
        response = supabase.table("submissions").select("created_at, coverage_percent").order("created_at").execute()
        data = response.data

        date_groups = defaultdict(list)
        for sub in data:
            if sub.get('coverage_percent'):
                date_str = sub['created_at'].split('T')[0] # YYYY-MM-DD
                date_groups[date_str].append(sub['coverage_percent'])
        
        results = []
        for date, coverages in date_groups.items():
            avg = sum(coverages) / len(coverages)
            results.append({"date": date, "average_coverage": round(avg, 1)})
        
        # Sort by date
        results.sort(key=lambda x: x['date'])
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status_distribution():
    """
    Returns count of reports by status.
    """
    try:
        response = supabase.table("submissions").select("status").execute()
        data = response.data

        counts = defaultdict(int)
        for sub in data:
            status = sub.get('status', 'unknown')
            counts[status] += 1
        
        results = [
            {"name": "Pending", "value": counts.get("pending", 0), "color": "#f59e0b"}, # Amber
            {"name": "Accepted", "value": counts.get("accepted", 0), "color": "#0ea5e9"}, # Sky
            {"name": "Completed", "value": counts.get("completed", 0), "color": "#10b981"}, # Emerald
            {"name": "Rejected", "value": counts.get("rejected", 0), "color": "#ef4444"}, # Red
        ]
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
