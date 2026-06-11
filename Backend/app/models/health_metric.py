from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Core diabetes-relevant features
    glucose = Column(Float, nullable=False)          # mg/dL
    bmi = Column(Float, nullable=True)
    blood_pressure = Column(Float, nullable=True)    # mmHg (diastolic)
    insulin = Column(Float, nullable=True)           # mu U/ml
    age = Column(Integer, nullable=True)
    pregnancies = Column(Integer, nullable=True, default=0)
    diabetes_pedigree = Column(Float, nullable=True) # family history score
    skin_thickness = Column(Float, nullable=True)    # mm

    # Lifestyle
    water_intake_ml = Column(Float, nullable=True)
    steps_today = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)

    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="health_metrics")