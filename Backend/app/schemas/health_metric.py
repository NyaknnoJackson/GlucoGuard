from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class HealthMetricCreate(BaseModel):
    # Core clinical fields
    glucose: float = Field(..., ge=0, le=500, description="Blood glucose in mg/dL")
    bmi: Optional[float] = Field(default=None, ge=0, le=100)
    blood_pressure: Optional[float] = Field(default=None, ge=0, le=300, description="Diastolic BP in mmHg")
    insulin: Optional[float] = Field(default=None, ge=0, description="Insulin in mu U/ml")
    age: Optional[int] = Field(default=None, ge=1, le=120)
    pregnancies: Optional[int] = Field(default=0, ge=0)
    diabetes_pedigree: Optional[float] = Field(default=None, ge=0, description="Family history score")
    skin_thickness: Optional[float] = Field(default=None, ge=0, description="Triceps skin fold in mm")

    # Lifestyle fields
    water_intake_ml: Optional[float] = Field(default=None, ge=0, description="Daily water intake in ml")
    steps_today: Optional[int] = Field(default=None, ge=0)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)


class HealthMetricOut(BaseModel):
    id: int
    user_id: int
    glucose: float
    bmi: Optional[float]
    blood_pressure: Optional[float]
    insulin: Optional[float]
    age: Optional[int]
    pregnancies: Optional[int]
    diabetes_pedigree: Optional[float]
    skin_thickness: Optional[float]
    water_intake_ml: Optional[float]
    steps_today: Optional[int]
    sleep_hours: Optional[float]
    recorded_at: datetime

    class Config:
        from_attributes = True


class HealthMetricListResponse(BaseModel):
    total: int
    offset: int
    limit: int
    metrics: List[HealthMetricOut]