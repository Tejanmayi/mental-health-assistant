# backend/app/api/llm.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai

# Define the router
router = APIRouter()

# Set up OpenAI API key (ensure it's in your .env or config)
openai.api_key = "your-openai-api-key-here"

# Define the request schema for the LLM input
class LLMRequest(BaseModel):
    text: str

# LLM assistant endpoint
@router.post("/get-advice")
def get_llm_advice(request: LLMRequest):
    input_text = request.text

    try:
        # Call OpenAI GPT (example: ChatCompletion)
        response = openai.Completion.create(
            engine="text-davinci-003",  # You can change the model
            prompt=input_text,
            max_tokens=100,
            n=1,
            stop=None,
            temperature=0.7,
        )
        # Return the response text from the model
        advice = response.choices[0].text.strip()
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error from OpenAI: {str(e)}")
