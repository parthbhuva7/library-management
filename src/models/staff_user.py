"""StaffUser model - library staff authentication."""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func

from models.base import Base


class StaffUser(Base):
    """Library staff user for authentication."""

    __tablename__ = "staff_users"

    id = Column(String(26), primary_key=True)
    username = Column(String(100), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
