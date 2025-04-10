# backend/app/api/ml.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Define the request schema
class PredictionRequest(BaseModel):
    text: str

# Dummy prediction logic for now
@router.post("/predict")
def predict_depression(request: PredictionRequest):
    input_text = request.text

    # You will replace this logic with your real ML model
    if "sad" in input_text.lower():
        prediction = "Depressed"
    else:
        prediction = "Not Depressed"

    return {"prediction": prediction}
