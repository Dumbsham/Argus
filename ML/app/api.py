from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from pathlib import Path
import os
import sys

# Ensure src is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models.lightgbm_detector import LightGBMDetector

app = FastAPI(title="PaySim Risk ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AppState:
    detector = None
    opt_thresh = 0.5
    model_version = "v1.0.0"

state = AppState()

@app.on_event("startup")
def load_model():
    base_dir = Path(__file__).parent.parent
    
    model_path = base_dir / "data" / "processed" / "lightgbm.pkl"
    thresh_path = base_dir / "data" / "processed" / "optimal_threshold.json"
    report_path = base_dir / "reports" / "test_evaluation_report.json"
    
    if model_path.exists():
        state.detector = LightGBMDetector.load(model_path)
        
    if report_path.exists():
        with open(report_path) as f:
            state.opt_thresh = json.load(f).get("threshold", 0.5)
    elif thresh_path.exists():
        with open(thresh_path) as f:
            data = json.load(f)
            state.opt_thresh = data.get("threshold", data.get("isolation_forest_threshold", 0.5))

@app.get("/model/health")
def model_health():
    if state.detector is not None:
        return {"status": "healthy"}
    raise HTTPException(status_code=503, detail="Model not loaded")

@app.get("/model/info")
def model_info():
    if state.detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_name": "LightGBMDetector",
        "version": state.model_version,
        "features": state.detector.feature_columns,
        "threshold": state.opt_thresh
    }

@app.post("/predict")
def predict(req: dict):
    if state.detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    df = pd.DataFrame([req])
    
    try:
        score_series = state.detector.predict_scores(df)
        prob = float(score_series.iloc[0])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")
        
    return {
        "fraud_probability": prob,
        "risk_score": prob * 100.0,
        "model_version": state.model_version
    }
