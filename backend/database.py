from sqlmodel import create_engine, Session
from typing import Generator
from config import settings
import os


# Determine if we're using test database (for testing purposes)
TESTING = os.getenv("TESTING", "False").lower() == "true"

if TESTING:
    DATABASE_URL = "sqlite:///./test.db"
else:
    DATABASE_URL = settings.database_url


# Create the database engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True to see SQL queries for debugging
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get a database session
    """
    with Session(engine) as session:
        yield session