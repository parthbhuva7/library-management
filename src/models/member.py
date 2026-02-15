"""Member model."""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from models.base import Base


class Member(Base):
    """Library member."""

    __tablename__ = "members"

    id = Column(String(26), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    borrows = relationship("Borrow", back_populates="member")
