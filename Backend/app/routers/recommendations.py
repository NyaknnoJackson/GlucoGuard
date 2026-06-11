from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: Optional[str] = Query(
        default=None,
        description="Filter by category: diet, exercise, sleep, hydration, alert"
    ),
    unread_only: bool = Query(default=False),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0)
):
    """
    Returns all recommendations for the authenticated user.
    Supports filtering by category and read/unread status.
    """
    query = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    )

    if category:
        query = query.filter(Recommendation.category == category)

    if unread_only:
        query = query.filter(Recommendation.is_read == False)

    total = query.count()
    recommendations = (
        query
        .order_by(desc(Recommendation.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "unread_count": db.query(Recommendation).filter(
            Recommendation.user_id == current_user.id,
            Recommendation.is_read == False
        ).count(),
        "recommendations": [_serialize(r) for r in recommendations]
    }


@router.get("/{rec_id}")
def get_single_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch a single recommendation by ID.
    Automatically marks it as read when retrieved individually.
    """
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == current_user.id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    # Auto-mark as read when the user opens it
    if not rec.is_read:
        rec.is_read = True
        db.commit()
        db.refresh(rec)

    return _serialize(rec)


@router.patch("/{rec_id}/read")
def mark_as_read(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Explicitly mark a recommendation as read.
    Called when user dismisses or acknowledges a recommendation card.
    """
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == current_user.id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.is_read = True
    db.commit()

    return {"id": rec_id, "is_read": True}


@router.patch("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marks ALL unread recommendations as read in one call.
    Used by the 'Mark all as read' button on the recommendations page.
    """
    updated = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == current_user.id,
            Recommendation.is_read == False
        )
        .all()
    )

    for rec in updated:
        rec.is_read = True

    db.commit()

    return {"marked_read": len(updated)}


@router.delete("/{rec_id}", status_code=204)
def delete_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a recommendation permanently.
    Users can dismiss recommendations they find irrelevant.
    """
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == current_user.id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    db.delete(rec)
    db.commit()


@router.delete("/", status_code=204)
def clear_all_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes ALL recommendations for the user.
    Useful for a 'Clear history' action in settings.
    """
    db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).delete()
    db.commit()


# ---------------------------------------------------------------------------
# Private helper
# ---------------------------------------------------------------------------

def _serialize(rec: Recommendation) -> dict:
    return {
        "id": rec.id,
        "category": rec.category,
        "title": rec.title,
        "body": rec.body,
        "is_read": rec.is_read,
        "created_at": rec.created_at.isoformat()
    }