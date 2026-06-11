from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.health_metric import HealthMetric
from app.schemas.health_metric import HealthMetricCreate, HealthMetricOut, HealthMetricListResponse

router = APIRouter(prefix="/health-metrics", tags=["Health Metrics"])


@router.post("/", response_model=HealthMetricOut, status_code=201)
def log_health_metric(
    payload: HealthMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log a new health metric entry for the authenticated user.
    Accepts glucose, BMI, blood pressure, insulin, lifestyle data, etc.
    """
    metric = HealthMetric(
        user_id=current_user.id,
        **payload.model_dump(exclude_none=True)
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


@router.get("/", response_model=HealthMetricListResponse)
def get_health_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    days: Optional[int] = Query(default=None, description="Filter to last N days")
):
    """
    Retrieve paginated health metric history for the authenticated user.
    Optionally filter by the last N days.
    """
    query = db.query(HealthMetric).filter(HealthMetric.user_id == current_user.id)

    if days:
        since = datetime.utcnow() - timedelta(days=days)
        query = query.filter(HealthMetric.recorded_at >= since)

    total = query.count()
    metrics = query.order_by(desc(HealthMetric.recorded_at)).offset(offset).limit(limit).all()

    return {"total": total, "offset": offset, "limit": limit, "metrics": metrics}


@router.get("/latest", response_model=HealthMetricOut)
def get_latest_metric(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the most recent health metric entry for the authenticated user.
    Used by the dashboard to show current health snapshot.
    """
    metric = (
        db.query(HealthMetric)
        .filter(HealthMetric.user_id == current_user.id)
        .order_by(desc(HealthMetric.recorded_at))
        .first()
    )
    if not metric:
        raise HTTPException(status_code=404, detail="No health metrics logged yet")
    return metric


@router.get("/{metric_id}", response_model=HealthMetricOut)
def get_single_metric(
    metric_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a specific metric entry by ID.
    Ensures users can only access their own records.
    """
    metric = db.query(HealthMetric).filter(
        HealthMetric.id == metric_id,
        HealthMetric.user_id == current_user.id  # ownership check
    ).first()

    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    return metric


@router.put("/{metric_id}", response_model=HealthMetricOut)
def update_health_metric(
    metric_id: int,
    payload: HealthMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing metric entry. Only the owner can update their records.
    """
    metric = db.query(HealthMetric).filter(
        HealthMetric.id == metric_id,
        HealthMetric.user_id == current_user.id
    ).first()

    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(metric, field, value)

    db.commit()
    db.refresh(metric)
    return metric


@router.delete("/{metric_id}", status_code=204)
def delete_health_metric(
    metric_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific metric entry. Returns 204 No Content on success.
    """
    metric = db.query(HealthMetric).filter(
        HealthMetric.id == metric_id,
        HealthMetric.user_id == current_user.id
    ).first()

    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")

    db.delete(metric)
    db.commit()