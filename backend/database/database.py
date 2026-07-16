from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres:tsaintweak%402603@localhost:5432/exampilot"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
from . import models

Base.metadata.create_all(bind=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()