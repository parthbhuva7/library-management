"""BookCopy model - copy-level inventory."""

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from models.base import Base


class BookCopy(Base):
    """Physical copy of a book."""

    __tablename__ = "book_copies"

    id = Column(String(26), primary_key=True)
    book_id = Column(String(26), ForeignKey("books.id"), nullable=False, index=True)
    copy_number = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="available", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    book = relationship("Book", back_populates="copies")
    borrows = relationship("Borrow", back_populates="copy")
