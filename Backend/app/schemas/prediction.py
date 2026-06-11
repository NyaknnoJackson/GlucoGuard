from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    glucose: float = Field(..., ge=0, le=500, description="Blood glucose mg/dL")
    bmi: float = Field(..., ge=0, le=70)
    age: int = Field(..., ge=1, le=120)
    blood_pressure: float = Field(default=72.0)
    insulin: float = Field(default=30.5)
    pregnancies: int = Field(default=0, ge=0)
    diabetes_pedigree: float = Field(default=0.37)
    skin_thickness: float = Field(default=23.0)

class PredictionResponse(BaseModel):
    prediction_id: int
    risk_score: float
    risk_label: str
    risk_percentage: float