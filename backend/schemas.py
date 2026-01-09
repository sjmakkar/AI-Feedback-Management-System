from pydantic import BaseModel, Field

class ReviewRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=1, max_length=2000)

class ReviewResponse(BaseModel):
    success: bool
    ai_response: str
