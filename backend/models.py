from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from db import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer)
    review_text = Column(Text)
    ai_user_reply = Column(Text)
    ai_summary = Column(Text)
    ai_recommended_actions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
