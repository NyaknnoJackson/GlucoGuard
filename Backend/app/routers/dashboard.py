from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.health_metric import HealthMetric
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregates all data the frontend dashboard needs in a single request.
    Avoids multiple round-trips from the client.
    """

    # --- Latest health metric snapshot ---
    latest_metric = (
        db.query(HealthMetric)
        .filter(HealthMetric.user_id == current_user.id)
        .order_by(desc(HealthMetric.recorded_at))
        .first()
    )

    # --- Glucose trend: last 7 days ---
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    glucose_trend = (
        db.query(HealthMetric.recorded_at, HealthMetric.glucose)
        .filter(
            HealthMetric.user_id == current_user.id,
            HealthMetric.recorded_at >= seven_days_ago
        )
        .order_by(HealthMetric.recorded_at)
        .all()
    )

    # --- Latest prediction ---
    latest_prediction = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(desc(Prediction.created_at))
        .first()
    )

    # --- Prediction history: last 5 ---
    prediction_history = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(desc(Prediction.created_at))
        .limit(5)
        .all()
    )

    # --- Unread recommendations ---
    unread_recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == current_user.id,
            Recommendation.is_read == False
        )
        .order_by(desc(Recommendation.created_at))
        .limit(5)
        .all()
    )

    # --- Stats summary ---
    total_metrics_logged = (
        db.query(func.count(HealthMetric.id))
        .filter(HealthMetric.user_id == current_user.id)
        .scalar()
    )

    avg_glucose_7d = (
        db.query(func.avg(HealthMetric.glucose))
        .filter(
            HealthMetric.user_id == current_user.id,
            HealthMetric.recorded_at >= seven_days_ago
        )
        .scalar()
    )

    avg_steps_7d = (
        db.query(func.avg(HealthMetric.steps_today))
        .filter(
            HealthMetric.user_id == current_user.id,
            HealthMetric.recorded_at >= seven_days_ago,
            HealthMetric.steps_today.isnot(None)
        )
        .scalar()
    )

    # --- Health score (simple heuristic 0–100) ---
    health_score = _compute_health_score(latest_metric, latest_prediction)

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
        },
        "health_snapshot": _serialize_metric(latest_metric),
        "glucose_trend": [
            {
                "date": row.recorded_at.strftime("%Y-%m-%d"),
                "glucose": row.glucose
            }
            for row in glucose_trend
        ],
        "latest_prediction": _serialize_prediction(latest_prediction),
        "prediction_history": [_serialize_prediction(p) for p in prediction_history],
        "recommendations": [
            {
                "id": r.id,
                "category": r.category,
                "title": r.title,
                "body": r.body,
                "is_read": r.is_read,
                "created_at": r.created_at.isoformat()
            }
            for r in unread_recommendations
        ],
        "stats": {
            "total_metrics_logged": total_metrics_logged or 0,
            "avg_glucose_7d": round(avg_glucose_7d, 1) if avg_glucose_7d else None,
            "avg_steps_7d": round(avg_steps_7d) if avg_steps_7d else None,
            "health_score": health_score,
        }
    }


@router.patch("/recommendations/{rec_id}/read", status_code=200)
def mark_recommendation_read(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marks a recommendation as read so it no longer appears in the
    unread count on the dashboard.
    """
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == current_user.id
    ).first()

    if not rec:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.is_read = True
    db.commit()
    return {"id": rec_id, "is_read": True}


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _serialize_metric(metric: HealthMetric | None) -> dict | None:
    if not metric:
        return None
    return {
        "id": metric.id,
        "glucose": metric.glucose,
        "bmi": metric.bmi,
        "blood_pressure": metric.blood_pressure,
        "insulin": metric.insulin,
        "water_intake_ml": metric.water_intake_ml,
        "steps_today": metric.steps_today,
        "sleep_hours": metric.sleep_hours,
        "recorded_at": metric.recorded_at.isoformat()
    }


def _serialize_prediction(prediction: Prediction | None) -> dict | None:
    if not prediction:
        return None
    return {
        "id": prediction.id,
        "risk_score": prediction.risk_score,
        "risk_label": prediction.risk_label,
        "risk_percentage": round(prediction.risk_score * 100, 1),
        "created_at": prediction.created_at.isoformat()
    }


def _compute_health_score(metric: HealthMetric | None, prediction: Prediction | None) -> int:
    """
    Simple heuristic health score from 0–100.
    Higher is better. Based on glucose range, BMI, and risk score.
    This is NOT a clinical score — it's a motivational UX indicator.
    """
    score = 100

    if prediction:
        # Risk score penalises heavily — max 40 point deduction
        score -= int(prediction.risk_score * 40)

    if metric:
        # Glucose outside normal fasting range (70–100 mg/dL)
        if metric.glucose:
            if metric.glucose > 180:
                score -= 25
            elif metric.glucose > 125:
                score -= 15
            elif metric.glucose > 100:
                score -= 5

        # BMI outside healthy range (18.5–24.9)
        if metric.bmi:
            if metric.bmi >= 35:
                score -= 15
            elif metric.bmi >= 30:
                score -= 10
            elif metric.bmi >= 25:
                score -= 5

        # Reward good sleep
        if metric.sleep_hours:
            if 7 <= metric.sleep_hours <= 9:
                score += 5

        # Reward hydration
        if metric.water_intake_ml and metric.water_intake_ml >= 2000:
            score += 5

        # Reward activity
        if metric.steps_today and metric.steps_today >= 8000:
            score += 5

    return max(0, min(100, score))  # clamp between 0 and 100