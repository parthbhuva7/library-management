"""
Library business logic service.
"""
from sqlalchemy.orm import Session

from app.library.repository import (
    BookRepository,
    BookCopyRepository,
    MemberRepository,
    BorrowRepository,
)

MAX_PAGE_LIMIT = 100


class LibraryService:
    """Business logic for library operations."""

    @staticmethod
    def create_book(
        session: Session,
        title: str,
        author: str,
        isbn: str | None = None
    ):
        """Create a new book."""
        return BookRepository.create(session, title, author, isbn)

    @staticmethod
    def update_book(
        session: Session,
        book_id: str,
        title: str | None = None,
        author: str | None = None,
        isbn: str | None = None
    ):
        """Update a book."""
        return BookRepository.update(
            session, book_id, title, author, isbn
        )

    @staticmethod
    def list_books(
        session: Session,
        page: int = 1,
        limit: int = 100
    ) -> tuple[list[tuple], int]:
        """
        List books with pagination and copy counts.

        Returns ((book, copy_count), total) to avoid N+1 queries.
        """
        limit = min(limit, MAX_PAGE_LIMIT)
        offset = (page - 1) * limit
        books = BookRepository.list_all(session, limit, offset)
        total = BookRepository.count(session)
        if not books:
            return [], total
        book_ids = [b.id for b in books]
        copy_counts = BookCopyRepository.count_by_book_ids(
            session, book_ids
        )
        result = [
            (book, copy_counts.get(book.id, 0))
            for book in books
        ]
        return result, total

    @staticmethod
    def create_member(session: Session, name: str, email: str):
        """Create a new member."""
        return MemberRepository.create(session, name, email)

    @staticmethod
    def update_member(
        session: Session,
        member_id: str,
        name: str | None = None,
        email: str | None = None
    ):
        """Update a member."""
        return MemberRepository.update(
            session, member_id, name, email
        )

    @staticmethod
    def list_members(
        session: Session,
        page: int = 1,
        limit: int = 100
    ) -> tuple[list, int]:
        """List members with pagination."""
        limit = min(limit, MAX_PAGE_LIMIT)
        offset = (page - 1) * limit
        members = MemberRepository.list_all(session, limit, offset)
        total = MemberRepository.count(session)
        return members, total

    @staticmethod
    def borrow_book(
        session: Session,
        copy_id: str,
        member_id: str
    ) -> tuple[object | None, str | None]:
        """
        Borrow a book copy. Uses pessimistic locking.

        Returns (borrow, error_message). Error is None on success.
        """
        copy = BookCopyRepository.find_by_id_with_lock(session, copy_id)
        if not copy:
            return None, "Copy not found"
        if copy.status != "available":
            return None, "Book not available"
        member = MemberRepository.find_by_id(session, member_id)
        if not member:
            return None, "Member not found"
        active = BorrowRepository.find_active_by_copy_id(session, copy_id)
        if active:
            return None, "Book not available"
        borrow = BorrowRepository.create(
            session, copy_id, member_id, commit=False
        )
        BookCopyRepository.update_status(
            session, copy_id, "checked_out", commit=False
        )
        session.commit()
        session.refresh(borrow)
        return borrow, None

    @staticmethod
    def return_book(
        session: Session,
        copy_id: str
    ) -> tuple[object | None, str | None]:
        """
        Return a book by copy id.

        Returns (borrow, error_message). Error is None on success.
        """
        active = BorrowRepository.find_active_by_copy_id(session, copy_id)
        if not active:
            return None, "No active borrow for this copy"
        BorrowRepository.mark_returned(session, active.id, commit=False)
        BookCopyRepository.update_status(
            session, copy_id, "available", commit=False
        )
        session.commit()
        session.refresh(active)
        return active, None

    @staticmethod
    def list_borrowings(
        session: Session,
        member_id: str | None = None,
        page: int = 1,
        limit: int = 100
    ) -> tuple[list, int]:
        """List borrowings, optionally filtered by member."""
        limit = min(limit, MAX_PAGE_LIMIT)
        offset = (page - 1) * limit
        total = BorrowRepository.count_active(session, member_id)
        if member_id:
            borrows = BorrowRepository.list_active_by_member(
                session, member_id, limit, offset
            )
        else:
            borrows = BorrowRepository.list_all_active(
                session, limit, offset
            )
        return borrows, total

    @staticmethod
    def create_book_copy(
        session: Session,
        book_id: str,
        copy_number: str
    ) -> tuple[object | None, str | None]:
        """
        Create a new book copy.

        Returns (copy, error_message). Error is None on success.
        """
        book = BookRepository.find_by_id(session, book_id)
        if not book:
            return None, "Book not found"
        existing = BookCopyRepository.find_by_book_and_copy_number(
            session, book_id, copy_number
        )
        if existing:
            return None, "Copy number already exists for this book"
        copy = BookCopyRepository.create(
            session, book_id, copy_number, status="available"
        )
        return copy, None

    @staticmethod
    def list_available_copies(
        session: Session,
        page: int = 1,
        limit: int = 100
    ) -> tuple[list, int]:
        """List available copies with book info."""
        limit = min(limit, MAX_PAGE_LIMIT)
        offset = (page - 1) * limit
        rows = BookCopyRepository.list_all_available_with_book(
            session, limit, offset
        )
        total = BookCopyRepository.count_available(session)
        return rows, total

    @staticmethod
    def list_copies_by_book_id(
        session: Session,
        book_id: str,
        page: int = 1,
        limit: int = 100
    ) -> tuple[list | None, int]:
        """
        List copies for a book with pagination.

        Returns (copies, total) or (None, 0) if book not found.
        """
        book = BookRepository.find_by_id(session, book_id)
        if not book:
            return None, 0
        limit = min(limit, MAX_PAGE_LIMIT)
        offset = (page - 1) * limit
        copies = BookCopyRepository.list_by_book_id(
            session, book_id, limit, offset
        )
        total = BookCopyRepository.count_by_book_id(session, book_id)
        return copies, total
