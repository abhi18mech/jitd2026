
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Database location
BASE_DIR = Path(__file__).resolve().parents[2]

DATABASE_DIR = BASE_DIR / "data"
DATABASE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = (
    f"sqlite:///{DATABASE_DIR / 'argus_x.db'}"
)


# Database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# Database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for database models
Base = declarative_base()


# Database dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()