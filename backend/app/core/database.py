"""Database connection and session handling using SQLAlchemy."""
import logging
from typing import Generator, Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("skillx.database")

# Handle SQLite connect_args if developer provides sqlite:/// URL for lightweight local testing
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=False,
        connect_args=connect_args,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.warning("Database engine initialization deferred: %s", str(e))
    # Provide a placeholder engine that will log an error on actual connection attempt
    engine = None
    SessionLocal = None

Base = declarative_base()


def get_db() -> Generator[Optional[Session], None, None]:
    """
    FastAPI Dependency for obtaining a database session.
    If the database is not yet running or configured, yields None so services
    can safely return clearly marked baseline/empty states without crashing.
    """
    if SessionLocal is None:
        yield None
        return

    db = None
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        logger.warning("Database connection failed: %s", str(e))
        yield None
    finally:
        if db is not None:
            try:
                db.close()
            except Exception:
                pass
