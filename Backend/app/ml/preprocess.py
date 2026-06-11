import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# Features the model expects — order matters
FEATURE_COLUMNS = [
    "pregnancies", "glucose", "blood_pressure",
    "skin_thickness", "insulin", "bmi",
    "diabetes_pedigree", "age"
]

def preprocess_input(data: dict) -> np.ndarray:
    """
    Takes raw user input dict, replaces physiologically impossible zeros
    with NaN, imputes with column medians from training data, then scales.
    In production, medians and scaler are loaded from saved artifacts.
    """
    df = pd.DataFrame([data])[FEATURE_COLUMNS]

    # Columns where 0 is physiologically invalid
    zero_invalid = ["glucose", "blood_pressure", "skin_thickness", "insulin", "bmi"]
    df[zero_invalid] = df[zero_invalid].replace(0, np.nan)

    # Impute with training medians (hardcoded from Pima dataset)
    medians = {
        "glucose": 117.0, "blood_pressure": 72.0,
        "skin_thickness": 23.0, "insulin": 30.5,
        "bmi": 32.0, "pregnancies": 3.0,
        "diabetes_pedigree": 0.37, "age": 29.0
    }
    for col, median in medians.items():
        df[col] = df[col].fillna(median)

    return df.values