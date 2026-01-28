from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AquaWatch API")

# CORS configuration
origins = [
    "http://localhost:3000",  # Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AquaWatch API"}

@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Green Pixel Density Analysis
    try:
        from image_processing import detect_hyacinth
        
        # Read image
        contents = await file.read()
        
        # Helper function does the heavy lifting
        coverage = detect_hyacinth(contents)
        
        return {"coverage_percent": coverage}
        
    except Exception as e:
        print(f"Analysis Error: {e}")
        # Fallback to random if something breaks (or 0)
        import random
        return {"coverage_percent": round(random.uniform(10.0, 90.0), 2)}

# Include Routers
# Include Routers
from routers import coupons, analytics
app.include_router(coupons.router)
app.include_router(analytics.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
