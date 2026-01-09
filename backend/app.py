from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import ReviewRequest, ReviewResponse
from db import SessionLocal, engine
from models import Review, Base
from llm import generate_ai_outputs
import json
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Read allowed frontend origins from env var (comma-separated). If not set, allow all origins.
raw_origins = os.getenv("FRONTEND_ORIGINS")

if not raw_origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[raw_origins, "https://aifeedbackfe.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.post("/submit-review", response_model=ReviewResponse)
def submit_review(data: ReviewRequest):
    if not data.review_text.strip():
        raise HTTPException(status_code=400, detail="Empty review")

    try:
        ai_raw = generate_ai_outputs(data.rating, data.review_text)
        ai_json = json.loads(ai_raw)
    except Exception:
        raise HTTPException(status_code=500, detail="AI processing failed")

    db = SessionLocal()
    review = Review(
        rating=data.rating,
        review_text=data.review_text,
        ai_user_reply=ai_json["user_reply"],
        ai_summary=ai_json["summary"],
        ai_recommended_actions=ai_json["recommended_actions"],
    )
    db.add(review)
    db.commit()
    db.close()

    return ReviewResponse(
        success=True,
        ai_response=ai_json["user_reply"]
    )

@app.get("/reviews")
def get_reviews():
    db = SessionLocal()
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    db.close()
    return reviews
