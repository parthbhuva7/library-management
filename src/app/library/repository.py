"""
Library data access layer using SQLAlchemy ORM.
"""
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.book import Book
from models.book_copy import BookCopy
from models.member import Member
from models.borrow import Borrow
from util.ulid_util import generate_ulid


class BookRepository:
    """Repository for Book (title-level catalog) operations."""

    @staticmethod
    def find_by_id(session: Session, book_id: str) -> Book | None:
        """Find a book by ID."""
        return session.get(Book, book_id)

    @staticmethod
    def create(
        session: Session,
        title: str,
        author: str,
        isbn: str | None = None
    ) -> Book:
        """Create a new book."""
        book = Book(
            id=generate_ulid(),
            title=title,
            author=author,
            isbn=isbn
        )
        session.add(book)
        session.commit()
        session.refresh(book)
        return book

    @staticmethod
    def update(
        session: Session,
        book_id: str,
        title: str | None = None,
        author: str | None = None,
        isbn: str | None = None
    ) -> Book | None:
        """Update an existing book."""
        book = session.get(Book, book_id)
        if not book:
            return None
        if title is not None:
            book.title = title
        if author is not None:
            book.author = author
        if isbn is not None:
            book.isbn = isbn
        session.commit()
        session.refresh(book)
        return book

    @staticmethod
    def list_all(
        session: Session,
        limit: int = 100,
        offset: int = 0
    ) -> list[Book]:
        """List all books with pagination."""
        return list(
            session.query(Book)
            .order_by(Book.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def count(session: Session) -> int:
        """Count total books."""
        return session.query(Book).count()


class BookCopyRepository:
    """Repository for BookCopy (copy-level inventory) operations."""

    @staticmethod
    def find_by_id(session: Session, copy_id: str) -> BookCopy | None:
        """Find a book copy by ID."""
        return session.get(BookCopy, copy_id)

    @staticmethod
    def find_by_id_with_lock(
        session: Session,
        copy_id: str
    ) -> BookCopy | None:
        """Find copy by ID with pessimistic lock (SELECT FOR UPDATE)."""
        return (
            session.query(BookCopy)
            .filter(BookCopy.id == copy_id)
            .with_for_update()
            .first()
        )

    @staticmethod
    def count_by_book_id(session: Session, book_id: str) -> int:
        """Count all copies for a book."""
        return (
            session.query(BookCopy)
            .filter(BookCopy.book_id == book_id)
            .count()
        )

    @staticmethod
    def count_by_book_ids(
        session: Session,
        book_ids: list[str]
    ) -> dict[str, int]:
        """
        Batch count copies for multiple books. Returns dict of book_id -> count.
        Books with zero copies are included with count 0.
        """
        if not book_ids:
            return {}
        rows = (
            session.query(BookCopy.book_id, func.count(BookCopy.id))
            .filter(BookCopy.book_id.in_(book_ids))
            .group_by(BookCopy.book_id)
            .all()
        )
        result = {bid: 0 for bid in book_ids}
        for book_id, count in rows:
            result[book_id] = count
        return result

    @staticmethod
    def list_by_book_id(
        session: Session,
        book_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> list[BookCopy]:
        """List copies for a book with pagination."""
        return list(
            session.query(BookCopy)
            .filter(BookCopy.book_id == book_id)
            .order_by(BookCopy.copy_number)
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def find_available_copies(
        session: Session,
        book_id: str
    ) -> list[BookCopy]:
        """Find all available copies of a book."""
        return list(
            session.query(BookCopy)
            .filter(
                BookCopy.book_id == book_id,
                BookCopy.status == "available"
            )
            .all()
        )

    @staticmethod
    def find_by_book_and_copy_number(
        session: Session,
        book_id: str,
        copy_number: str
    ) -> BookCopy | None:
        """Find copy by book_id and copy_number."""
        return (
            session.query(BookCopy)
            .filter(
                BookCopy.book_id == book_id,
                BookCopy.copy_number == copy_number
            )
            .first()
        )

    @staticmethod
    def list_all_available_with_book(
        session: Session,
        limit: int = 100,
        offset: int = 0
    ) -> list[tuple[BookCopy, Book]]:
        """List all available copies with joined book info."""
        return list(
            session.query(BookCopy, Book)
            .join(Book, BookCopy.book_id == Book.id)
            .filter(BookCopy.status == "available")
            .order_by(Book.title, BookCopy.copy_number)
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def count_available(session: Session) -> int:
        """Count total available copies."""
        return (
            session.query(BookCopy)
            .filter(BookCopy.status == "available")
            .count()
        )

    @staticmethod
    def create(
        session: Session,
        book_id: str,
        copy_number: str,
        status: str = "available"
    ) -> BookCopy:
        """Create a new book copy."""
        copy = BookCopy(
            id=generate_ulid(),
            book_id=book_id,
            copy_number=copy_number,
            status=status
        )
        session.add(copy)
        session.commit()
        session.refresh(copy)
        return copy

    @staticmethod
    def update_status(
        session: Session,
        copy_id: str,
        status: str,
        commit: bool = True
    ) -> BookCopy | None:
        """Update copy status."""
        copy = session.get(BookCopy, copy_id)
        if not copy:
            return None
        copy.status = status
        if commit:
            session.commit()
            session.refresh(copy)
        return copy


class MemberRepository:
    """Repository for Member operations."""

    @staticmethod
    def find_by_id(session: Session, member_id: str) -> Member | None:
        """Find a member by ID."""
        return session.get(Member, member_id)

    @staticmethod
    def find_by_email(session: Session, email: str) -> Member | None:
        """Find a member by email."""
        return (
            session.query(Member)
            .filter(Member.email == email)
            .first()
        )

    @staticmethod
    def create(
        session: Session,
        name: str,
        email: str
    ) -> Member:
        """Create a new member."""
        member = Member(
            id=generate_ulid(),
            name=name,
            email=email
        )
        session.add(member)
        session.commit()
        session.refresh(member)
        return member

    @staticmethod
    def update(
        session: Session,
        member_id: str,
        name: str | None = None,
        email: str | None = None
    ) -> Member | None:
        """Update an existing member."""
        member = session.get(Member, member_id)
        if not member:
            return None
        if name is not None:
            member.name = name
        if email is not None:
            member.email = email
        session.commit()
        session.refresh(member)
        return member

    @staticmethod
    def list_all(
        session: Session,
        limit: int = 100,
        offset: int = 0
    ) -> list[Member]:
        """List all members with pagination."""
        return list(
            session.query(Member)
            .order_by(Member.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def count(session: Session) -> int:
        """Count total members."""
        return session.query(Member).count()


class BorrowRepository:
    """Repository for Borrow operations."""

    @staticmethod
    def find_by_id(session: Session, borrow_id: str) -> Borrow | None:
        """Find a borrow by ID."""
        return session.get(Borrow, borrow_id)

    @staticmethod
    def find_active_by_copy_id(
        session: Session,
        copy_id: str
    ) -> Borrow | None:
        """Find active borrow for a copy."""
        return (
            session.query(Borrow)
            .filter(
                Borrow.copy_id == copy_id,
                Borrow.status == "active"
            )
            .first()
        )

    @staticmethod
    def create(
        session: Session,
        copy_id: str,
        member_id: str,
        commit: bool = True
    ) -> Borrow:
        """Create a new borrow record."""
        borrow = Borrow(
            id=generate_ulid(),
            copy_id=copy_id,
            member_id=member_id,
            status="active"
        )
        session.add(borrow)
        if commit:
            session.commit()
            session.refresh(borrow)
        return borrow

    @staticmethod
    def mark_returned(
        session: Session,
        borrow_id: str,
        commit: bool = True
    ) -> Borrow | None:
        """Mark a borrow as returned."""
        borrow = session.get(Borrow, borrow_id)
        if not borrow:
            return None
        borrow.status = "returned"
        borrow.returned_at = datetime.now(timezone.utc)
        if commit:
            session.commit()
            session.refresh(borrow)
        return borrow

    @staticmethod
    def list_active_by_member(
        session: Session,
        member_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> list[Borrow]:
        """List active borrows for a member."""
        from sqlalchemy.orm import joinedload
        return list(
            session.query(Borrow)
            .options(
                joinedload(Borrow.copy).joinedload(BookCopy.book),
                joinedload(Borrow.member)
            )
            .filter(
                Borrow.member_id == member_id,
                Borrow.status == "active"
            )
            .order_by(Borrow.borrowed_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def list_all_active(
        session: Session,
        limit: int = 100,
        offset: int = 0
    ) -> list[Borrow]:
        """List all active borrows."""
        from sqlalchemy.orm import joinedload
        return list(
            session.query(Borrow)
            .options(
                joinedload(Borrow.copy).joinedload(BookCopy.book),
                joinedload(Borrow.member)
            )
            .filter(Borrow.status == "active")
            .order_by(Borrow.borrowed_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def count_active(session: Session, member_id: str | None = None) -> int:
        """Count active borrows, optionally by member."""
        query = session.query(Borrow).filter(Borrow.status == "active")
        if member_id:
            query = query.filter(Borrow.member_id == member_id)
        return query.count()
