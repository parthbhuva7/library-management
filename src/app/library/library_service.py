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
from util.exceptions import ConflictError, ResourceNotFound, ValidationError
from util.validators import validate_ulid, clamp_pagination


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
    def get_book_by_id(session: Session, book_id: str) -> tuple:
        """
        Get a book by ID with copy count.

        Returns:
            Tuple of (book, copy_count).

        Raises:
            ValidationError: If book_id is malformed.
            ResourceNotFound: If book does not exist.
        """
        validate_ulid(book_id, "book_id")
        book = BookRepository.find_by_id(session, book_id)
        if not book:
            raise ResourceNotFound("Book not found")
        copy_count = BookCopyRepository.count_by_book_id(session, book_id)
        return book, copy_count

    @staticmethod
    def get_member_by_id(session: Session, member_id: str):
        """
        Get a member by ID.

        Raises:
            ValidationError: If member_id is malformed.
            ResourceNotFound: If member does not exist.
        """
        validate_ulid(member_id, "member_id")
        member = MemberRepository.find_by_id(session, member_id)
        if not member:
            raise ResourceNotFound("Member not found")
        return member

    @staticmethod
    def list_books(
        session: Session,
        page: int = 1,
        limit: int = 100,
        title: str | None = None,
        author: str | None = None,
        isbn: str | None = None,
        query: str | None = None
    ) -> tuple[list[tuple], int]:
        """
        List books with pagination and copy counts.

        Supports optional filters (case-insensitive contains).
        When query is provided, searches title OR author OR isbn.
        When all filters empty/null, returns all books.
        Pagination is clamped to valid range.
        """
        page, limit = clamp_pagination(page, limit)
        offset = (page - 1) * limit
        has_filter = bool(title or author or isbn or (query and query.strip()))
        if has_filter:
            books = BookRepository.list_filtered(
                session, title, author, isbn, query, limit, offset
            )
            total = BookRepository.count_filtered(
                session, title, author, isbn, query
            )
        else:
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
        limit: int = 100,
        name: str | None = None,
        email: str | None = None,
        query: str | None = None
    ) -> tuple[list, int]:
        """
        List members with pagination.

        Supports optional filters (case-insensitive contains).
        When query is provided, searches name OR email.
        When all filters empty/null, returns all members.
        Pagination is clamped to valid range.
        """
        page, limit = clamp_pagination(page, limit)
        offset = (page - 1) * limit
        has_filter = bool(name or email or (query and query.strip()))
        if has_filter:
            members = MemberRepository.list_filtered(
                session, name, email, query, limit, offset
            )
            total = MemberRepository.count_filtered(
                session, name, email, query
            )
        else:
            members = MemberRepository.list_all(session, limit, offset)
            total = MemberRepository.count(session)
        return members, total

    @staticmethod
    def borrow_book(
        session: Session,
        copy_id: str,
        member_id: str
    ):
        """
        Borrow a book copy. Uses pessimistic locking.

        Raises:
            ResourceNotFound: If copy or member not found.
            ConflictError: If book not available.
        """
        copy = BookCopyRepository.find_by_id_with_lock(session, copy_id)
        if not copy:
            raise ResourceNotFound("Copy not found")
        if copy.status != "available":
            raise ConflictError("Book not available")
        member = MemberRepository.find_by_id(session, member_id)
        if not member:
            raise ResourceNotFound("Member not found")
        active = BorrowRepository.find_active_by_copy_id(session, copy_id)
        if active:
            raise ConflictError("Book not available")
        borrow = BorrowRepository.create(
            session, copy_id, member_id, commit=False
        )
        BookCopyRepository.update_status(
            session, copy_id, "checked_out", commit=False
        )
        session.commit()
        session.refresh(borrow)
        return borrow

    @staticmethod
    def return_book(session: Session, copy_id: str):
        """
        Return a book by copy id.

        Raises:
            ConflictError: If no active borrow for this copy.
        """
        active = BorrowRepository.find_active_by_copy_id(session, copy_id)
        if not active:
            raise ConflictError("No active borrow for this copy")
        BorrowRepository.mark_returned(session, active.id, commit=False)
        BookCopyRepository.update_status(
            session, copy_id, "available", commit=False
        )
        session.commit()
        session.refresh(active)
        return active

    @staticmethod
    def list_borrowings(
        session: Session,
        member_id: str | None = None,
        page: int = 1,
        limit: int = 100,
        query: str | None = None
    ) -> tuple[list, int]:
        """
        List borrowings, optionally filtered by member and search query.

        When query is provided, filters by book.title, member.name,
        member.email, copy_id, copy_number, status.
        """
        page, limit = clamp_pagination(page, limit)
        offset = (page - 1) * limit
        if query and query.strip():
            borrows = BorrowRepository.list_active_filtered(
                session, query, member_id, limit, offset
            )
            total = BorrowRepository.count_active_filtered(
                session, query, member_id
            )
        else:
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
    ):
        """
        Create a new book copy.

        Raises:
            ResourceNotFound: If book not found.
            ConflictError: If copy number already exists for this book.
        """
        book = BookRepository.find_by_id(session, book_id)
        if not book:
            raise ResourceNotFound("Book not found")
        existing = BookCopyRepository.find_by_book_and_copy_number(
            session, book_id, copy_number
        )
        if existing:
            raise ConflictError("Copy number already exists for this book")
        return BookCopyRepository.create(
            session, book_id, copy_number, status="available"
        )

    @staticmethod
    def list_available_copies(
        session: Session,
        page: int = 1,
        limit: int = 100
    ) -> tuple[list, int]:
        """List available copies with book info."""
        page, limit = clamp_pagination(page, limit)
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
        page, limit = clamp_pagination(page, limit)
        offset = (page - 1) * limit
        copies = BookCopyRepository.list_by_book_id(
            session, book_id, limit, offset
        )
        total = BookCopyRepository.count_by_book_id(session, book_id)
        return copies, total
