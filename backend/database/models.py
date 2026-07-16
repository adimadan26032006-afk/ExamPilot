from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
from datetime import datetime

class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    filepath = Column(String)
    pages = Column(Integer)
    upload_date = Column(DateTime, default=datetime.utcnow)