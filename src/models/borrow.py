"""Borrow model - lending record."""

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from models.base import Base


class Borrow(Base):
    """Borrow record linking member to book copy."""

    __tablename__ = "borrows"

    id = Column(String(26), primary_key=True)
    copy_id = Column(String(26), ForeignKey("book_copies.id"), nullable=False, index=True)
    member_id = Column(String(26), ForeignKey("members.id"), nullable=False, index=True)
    borrowed_at = Column(DateTime(timezone=True), server_default=func.now())
    returned_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default="active", index=True)

    copy = relationship("BookCopy", back_populates="borrows")
    member = relationship("Member", back_populates="borrows")
