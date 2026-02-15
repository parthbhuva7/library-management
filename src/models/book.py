"""Book model - title-level catalog entry."""

from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from models.base import Base


class Book(Base):
    """Title-level catalog entry for books."""

    __tablename__ = "books"

    id = Column(String(26), primary_key=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    isbn = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    copies = relationship("BookCopy", back_populates="book")
