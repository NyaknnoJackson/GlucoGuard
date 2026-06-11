import joblib
import numpy as np
from app.ml.preprocess import preprocess_input

# Load once at module import (not per-request)
model = joblib.load("app/ml/model.pkl")
scaler = joblib.load("app/ml/scaler.pkl")

RISK_THRESHOLDS = {
    "low": 0.35,
    "moderate": 0.65
}

def predict_risk(input_data: dict) -> dict:
    """
    Returns risk_score (float 0-1), risk_label, and feature contributions.
    """
    features = preprocess_input(input_data)
    features_scaled = scaler.transform(features)
    
    risk_score = float(model.predict_proba(features_scaled)[0][1])
    
    if risk_score < RISK_THRESHOLDS["low"]:
        risk_label = "Low"
    elif risk_score < RISK_THRESHOLDS["moderate"]:
        risk_label = "Moderate"
    else:
        risk_label = "High"
    
    return {
        "risk_score": round(risk_score, 4),
        "risk_label": risk_label,
        "risk_percentage": round(risk_score * 100, 1)
    }