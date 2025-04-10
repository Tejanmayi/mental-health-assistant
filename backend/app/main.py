from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ml, search, llm

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or deployed frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ml.router, prefix="/ml", tags=["ML"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(llm.router, prefix="/llm", tags=["LLM"])
