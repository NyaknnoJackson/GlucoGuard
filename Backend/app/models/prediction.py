from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    risk_score = Column(Float, nullable=False)        # 0.0 to 1.0
    risk_label = Column(String, nullable=False)       # Low / Moderate / High
    input_features = Column(JSON, nullable=False)     # snapshot of what was submitted
    model_version = Column(String, default="xgb-v1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")