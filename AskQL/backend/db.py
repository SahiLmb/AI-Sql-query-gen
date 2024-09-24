# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Retrieve the database URL from the .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# Create an engine for PostgreSQL
engine = create_engine(DATABASE_URL)

# Create a session factory to interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class to create database models
Base = declarative_base()

# Dependency for getting the database session in FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
