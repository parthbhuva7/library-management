"""
gRPC service handlers for LibraryService.
"""
import logging

import grpc
from sqlalchemy.exc import IntegrityError, OperationalError
from config import JWT_SECRET
from util.database import session_context
from util.exceptions import ConflictError, ResourceNotFound, ValidationError
from util.validators import clamp_pagination
from app.auth.auth_service import AuthService
from app.auth.repository import StaffUserRepository
from app.library.library_service import LibraryService

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "generated"))
from proto import library_pb2
from proto import auth_pb2
from proto import library_service_pb2_grpc

logger = logging.getLogger(__name__)

AUTH_METADATA_KEY = "authorization"


def _get_token_from_context(context) -> str | None:
    """Extract Bearer token from gRPC metadata."""
    metadata = dict(context.invocation_metadata()) if context.invocation_metadata() else {}
    auth = metadata.get(AUTH_METADATA_KEY) or metadata.get("Authorization")
    if auth and auth.startswith("Bearer "):
        return auth[7:]
    return None


def _require_auth(context) -> str | None:
    """Validate auth and return user_id. Sets UNAUTHENTICATED and returns None if invalid."""
    token = _get_token_from_context(context)
    if not token:
        context.set_code(grpc.StatusCode.UNAUTHENTICATED)
        context.set_details("Missing or invalid authorization")
        return None
    user_id = AuthService.validate_session(token, JWT_SECRET)
    if not user_id:
        context.set_code(grpc.StatusCode.UNAUTHENTICATED)
        context.set_details("Invalid or expired token")
        return None
    return user_id


def _model_to_book_proto(book, copy_count: int | None = None) -> library_pb2.Book:
    """Convert Book model to proto."""
    p = library_pb2.Book()
    p.id = book.id
    p.title = book.title
    p.author = book.author
    if book.isbn:
        p.isbn = book.isbn
    if copy_count is not None:
        p.copy_count = copy_count
    return p


def _model_to_member_proto(member) -> library_pb2.Member:
    """Convert Member model to proto."""
    p = library_pb2.Member()
    p.id = member.id
    p.name = member.name
    p.email = member.email
    return p


def _model_to_borrow_proto(borrow) -> library_pb2.Borrow:
    """Convert Borrow model to proto."""
    p = library_pb2.Borrow()
    p.id = borrow.id
    p.copy_id = borrow.copy_id
    p.member_id = borrow.member_id
    p.status = borrow.status
    if borrow.borrowed_at:
        p.borrowed_at = borrow.borrowed_at.isoformat()
    if borrow.returned_at:
        p.returned_at = borrow.returned_at.isoformat()
    if hasattr(borrow, "copy") and borrow.copy:
        p.copy.CopyFrom(_model_to_book_copy_proto(borrow.copy))
        if borrow.copy.book:
            p.book.CopyFrom(_model_to_book_proto(borrow.copy.book))
    if hasattr(borrow, "member") and borrow.member:
        p.member.CopyFrom(_model_to_member_proto(borrow.member))
    return p


def _model_to_book_copy_proto(copy) -> library_pb2.BookCopy:
    """Convert BookCopy model to proto."""
    p = library_pb2.BookCopy()
    p.id = copy.id
    p.book_id = copy.book_id
    p.copy_number = copy.copy_number
    p.status = copy.status
    return p


class LibraryServiceHandler(library_service_pb2_grpc.LibraryServiceServicer):
    """gRPC handler for LibraryService."""

    def Login(self, request, context):
        """Authenticate staff and return JWT token."""
        logger.info("Login attempt for user: %s", request.username)
        with session_context() as session:
            result = AuthService.login(
                session,
                request.username,
                request.password,
                JWT_SECRET
            )
            if not result:
                logger.warning("Login failed for user: %s", request.username)
                context.set_code(grpc.StatusCode.UNAUTHENTICATED)
                context.set_details("Invalid credentials")
                return auth_pb2.LoginResponse()
            logger.info("Login successful for user: %s", request.username)
            return auth_pb2.LoginResponse(
                token=result["token"],
                expires_at=result["expires_at"]
            )

    def CreateBook(self, request, context):
        """Create a new book."""
        if _require_auth(context) is None:
            return library_pb2.CreateBookResponse()
        with session_context() as session:
            book = LibraryService.create_book(
                session,
                request.title,
                request.author,
                request.isbn or None
            )
            return library_pb2.CreateBookResponse(book=_model_to_book_proto(book))

    def UpdateBook(self, request, context):
        """Update a book."""
        if _require_auth(context) is None:
            return library_pb2.UpdateBookResponse()
        with session_context() as session:
            book = LibraryService.update_book(
                session,
                request.id,
                request.title or None,
                request.author or None,
                request.isbn or None
            )
            if not book:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Book not found")
                return library_pb2.UpdateBookResponse()
            return library_pb2.UpdateBookResponse(book=_model_to_book_proto(book))

    def GetBook(self, request, context):
        """Get a book by ID with copy count."""
        if _require_auth(context) is None:
            return library_pb2.GetBookResponse()
        book_id = request.id or ""
        try:
            with session_context() as session:
                book, copy_count = LibraryService.get_book_by_id(
                    session, book_id
                )
                return library_pb2.GetBookResponse(
                    book=_model_to_book_proto(book, copy_count)
                )
        except ValidationError as exc:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details(str(exc))
            return library_pb2.GetBookResponse()
        except ResourceNotFound as exc:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(str(exc))
            return library_pb2.GetBookResponse()
        except (IntegrityError, OperationalError) as exc:
            logger.exception("Database error in GetBook: %s", exc)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("An error occurred")
            return library_pb2.GetBookResponse()

    def GetMember(self, request, context):
        """Get a member by ID."""
        if _require_auth(context) is None:
            return library_pb2.GetMemberResponse()
        member_id = request.id or ""
        try:
            with session_context() as session:
                member = LibraryService.get_member_by_id(session, member_id)
                return library_pb2.GetMemberResponse(
                    member=_model_to_member_proto(member)
                )
        except ValidationError as exc:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details(str(exc))
            return library_pb2.GetMemberResponse()
        except ResourceNotFound as exc:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(str(exc))
            return library_pb2.GetMemberResponse()
        except (IntegrityError, OperationalError) as exc:
            logger.exception("Database error in GetMember: %s", exc)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("An error occurred")
            return library_pb2.GetMemberResponse()

    def ListBooks(self, request, context):
        """List books with pagination and copy counts."""
        if _require_auth(context) is None:
            return library_pb2.ListBooksResponse()
        with session_context() as session:
            page = request.pagination.page if request.pagination else 1
            limit = request.pagination.limit if request.pagination else 100
            page, limit = clamp_pagination(page, limit)
            title = request.title or None
            author = request.author or None
            isbn = request.isbn or None
            query = request.query or None
            if query is not None and not query.strip():
                query = None
            books_with_counts, total = LibraryService.list_books(
                session, page, limit, title, author, isbn, query
            )
            book_protos = [
                _model_to_book_proto(book, copy_count)
                for book, copy_count in books_with_counts
            ]
            return library_pb2.ListBooksResponse(
                books=book_protos,
                pagination=library_pb2.PaginationResponse(
                    page=page,
                    limit=limit,
                    total_count=total
                )
            )

    def CreateMember(self, request, context):
        """Create a new member."""
        if _require_auth(context) is None:
            return library_pb2.CreateMemberResponse()
        with session_context() as session:
            member = LibraryService.create_member(
                session,
                request.name,
                request.email
            )
            return library_pb2.CreateMemberResponse(
                member=_model_to_member_proto(member)
            )

    def UpdateMember(self, request, context):
        """Update a member."""
        if _require_auth(context) is None:
            return library_pb2.UpdateMemberResponse()
        with session_context() as session:
            member = LibraryService.update_member(
                session,
                request.id,
                request.name or None,
                request.email or None
            )
            if not member:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Member not found")
                return library_pb2.UpdateMemberResponse()
            return library_pb2.UpdateMemberResponse(
                member=_model_to_member_proto(member)
            )

    def ListMembers(self, request, context):
        """List members with pagination."""
        if _require_auth(context) is None:
            return library_pb2.ListMembersResponse()
        with session_context() as session:
            page = request.pagination.page if request.pagination else 1
            limit = request.pagination.limit if request.pagination else 100
            page, limit = clamp_pagination(page, limit)
            name = request.name or None
            email = request.email or None
            query = request.query or None
            if query is not None and not query.strip():
                query = None
            members, total = LibraryService.list_members(
                session, page, limit, name, email, query
            )
            return library_pb2.ListMembersResponse(
                members=[_model_to_member_proto(m) for m in members],
                pagination=library_pb2.PaginationResponse(
                    page=page,
                    limit=limit,
                    total_count=total
                )
            )

    def BorrowBook(self, request, context):
        """Borrow a book copy (with pessimistic locking)."""
        if _require_auth(context) is None:
            return library_pb2.BorrowBookResponse()
        try:
            with session_context() as session:
                borrow = LibraryService.borrow_book(
                    session,
                    request.copy_id,
                    request.member_id
                )
                return library_pb2.BorrowBookResponse(
                    borrow=_model_to_borrow_proto(borrow)
                )
        except ResourceNotFound as exc:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(str(exc))
            return library_pb2.BorrowBookResponse()
        except ConflictError as exc:
            logger.warning("Borrow failed: %s", exc)
            context.set_code(grpc.StatusCode.FAILED_PRECONDITION)
            context.set_details(str(exc))
            return library_pb2.BorrowBookResponse()

    def ReturnBook(self, request, context):
        """Return a book by copy id."""
        if _require_auth(context) is None:
            return library_pb2.ReturnBookResponse()
        try:
            with session_context() as session:
                borrow = LibraryService.return_book(
                    session,
                    request.copy_id
                )
                return library_pb2.ReturnBookResponse(
                    borrow=_model_to_borrow_proto(borrow)
                )
        except ConflictError as exc:
            logger.warning("Return failed: %s", exc)
            context.set_code(grpc.StatusCode.FAILED_PRECONDITION)
            context.set_details(str(exc))
            return library_pb2.ReturnBookResponse()

    def ListBorrowings(self, request, context):
        """List borrowings, optionally by member."""
        if _require_auth(context) is None:
            return library_pb2.ListBorrowingsResponse()
        with session_context() as session:
            page = request.pagination.page if request.pagination else 1
            limit = request.pagination.limit if request.pagination else 100
            page, limit = clamp_pagination(page, limit)
            member_id = request.member_id or None
            query = request.query or None
            if query is not None and not query.strip():
                query = None
            borrows, total = LibraryService.list_borrowings(
                session, member_id, page, limit, query
            )
            return library_pb2.ListBorrowingsResponse(
                borrows=[_model_to_borrow_proto(b) for b in borrows],
                pagination=library_pb2.PaginationResponse(
                    page=page,
                    limit=limit,
                    total_count=total
                )
            )

    def CreateBookCopy(self, request, context):
        """Create a new book copy."""
        if _require_auth(context) is None:
            return library_pb2.CreateBookCopyResponse()
        try:
            with session_context() as session:
                copy = LibraryService.create_book_copy(
                    session,
                    request.book_id,
                    request.copy_number or ""
                )
                return library_pb2.CreateBookCopyResponse(
                    copy=_model_to_book_copy_proto(copy)
                )
        except ResourceNotFound as exc:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(str(exc))
            return library_pb2.CreateBookCopyResponse()
        except ConflictError as exc:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details(str(exc))
            return library_pb2.CreateBookCopyResponse()

    def ListAvailableCopies(self, request, context):
        """List available copies with book info."""
        if _require_auth(context) is None:
            return library_pb2.ListAvailableCopiesResponse()
        with session_context() as session:
            page = request.pagination.page if request.pagination else 1
            limit = request.pagination.limit if request.pagination else 100
            page, limit = clamp_pagination(page, limit)
            rows, total = LibraryService.list_available_copies(
                session, page, limit
            )
            copies = []
            for copy, book in rows:
                ac = library_pb2.AvailableCopy()
                ac.id = copy.id
                ac.book_id = copy.book_id
                ac.book_title = book.title
                ac.copy_number = copy.copy_number
                copies.append(ac)
            return library_pb2.ListAvailableCopiesResponse(
                copies=copies,
                pagination=library_pb2.PaginationResponse(
                    page=page,
                    limit=limit,
                    total_count=total
                )
            )

    def ListCopiesByBook(self, request, context):
        """List copies for a book with pagination."""
        if _require_auth(context) is None:
            return library_pb2.ListCopiesByBookResponse()
        with session_context() as session:
            book_id = request.book_id or ""
            if not book_id:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("book_id is required")
                return library_pb2.ListCopiesByBookResponse()
            page = request.pagination.page if request.pagination else 1
            limit = request.pagination.limit if request.pagination else 100
            page, limit = clamp_pagination(page, limit)
            copies, total = LibraryService.list_copies_by_book_id(
                session, book_id, page, limit
            )
            if copies is None:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Book not found")
                return library_pb2.ListCopiesByBookResponse()
            return library_pb2.ListCopiesByBookResponse(
                copies=[_model_to_book_copy_proto(c) for c in copies],
                pagination=library_pb2.PaginationResponse(
                    page=page,
                    limit=limit,
                    total_count=total
                )
            )
