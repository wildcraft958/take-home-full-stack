"""
Database Configuration

This module sets up the SQLAlchemy database connection.
The connection URL is read from the DATABASE_URL environment variable.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://booking_user:booking_pass@localhost:5432/booking_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_database_session():
    """
    Dependency to provide a database session for a request context.
    
    Yields:
        Session: A standard SQLAlchemy database session.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
