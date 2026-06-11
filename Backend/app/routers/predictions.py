from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.ml.predict import predict_risk
from app.services.recommendation_service import generate_recommendations

router = APIRouter(prefix="/predict", tags=["Predictions"])

@router.post("/", response_model=PredictionResponse)
def run_prediction(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = predict_risk(payload.model_dump())

    # Persist prediction
    prediction = Prediction(
        user_id=current_user.id,
        risk_score=result["risk_score"],
        risk_label=result["risk_label"],
        input_features=payload.model_dump()
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # Auto-generate recommendations based on risk
    generate_recommendations(db, current_user.id, result, payload.model_dump())

    return {**result, "prediction_id": prediction.id}