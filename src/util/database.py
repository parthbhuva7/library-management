"""
Database session management for SQLAlchemy.
"""
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from config import DATABASE_URL
from models.base import Base

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_session() -> Session:
    """Get a new database session."""
    return SessionLocal()


@contextmanager
def session_context():
    """
    Context manager for database session lifecycle.

    Yields a session, ensures rollback on exception, and always closes
    the session. Use this for all database operations to guarantee
    proper resource cleanup.
    """
    session = SessionLocal()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """Create all tables (for development; use Alembic in production)."""
    Base.metadata.create_all(bind=engine)
