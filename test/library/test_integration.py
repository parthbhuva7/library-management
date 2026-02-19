"""
Integration tests for library flows.
"""
import sys
from pathlib import Path

root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root / "src"))
sys.path.insert(0, str(root / "src" / "generated"))

import unittest
import os
import grpc
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.staff_user import StaffUser
from util.ulid_util import generate_ulid
from app.auth.auth_service import AuthService
from app.auth.repository import StaffUserRepository
from app.library.grpc_handlers import LibraryServiceHandler
from app.library.repository import (
    BookRepository,
    BookCopyRepository,
    MemberRepository,
)
from proto import library_pb2, auth_pb2


class MockContext:
    """Mock gRPC context for testing."""

    def __init__(self):
        self._code = None
        self._details = None
        self._metadata = {}

    def set_code(self, code):
        """Set status code."""
        self._code = code

    def set_details(self, details):
        """Set error details."""
        self._details = details

    def invocation_metadata(self):
        """Return metadata for auth."""
        return [(k, v) for k, v in self._metadata.items()]

    def set_metadata(self, key, value):
        """Set metadata (e.g. authorization)."""
        self._metadata[key] = value


def get_test_engine():
    """Create in-memory SQLite engine."""
    return create_engine("sqlite:///:memory:")


class TestLibraryIntegration(unittest.TestCase):
    """Integration tests for full library flows."""

    def setUp(self):
        """Set up test database and staff user."""
        os.environ["DATABASE_URL"] = "sqlite:///:memory:"
        os.environ["JWT_SECRET"] = "test-secret-key-for-integration-tests"
        self.engine = get_test_engine()
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

        from util import database
        database.engine = self.engine
        database.SessionLocal = self.Session

        session = self.Session()
        auth = AuthService("test-secret-key-for-integration-tests")
        self.staff = StaffUserRepository.create(
            session,
            "staff1",
            auth.hash_password("password123")
        )
        session.close()

        self.handler = LibraryServiceHandler()
        self.ctx = MockContext()

    def tearDown(self):
        """Clean up."""
        from util import database
        database.engine = create_engine(
            os.getenv("DATABASE_URL", "sqlite:///test.db")
        )

    def test_login_create_book_borrow_return_flow(self):
        """Full flow: login, create book, copy, borrow, return, list."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.assertEqual(self.ctx._code, None)
        self.assertTrue(len(login_resp.token) > 0)

        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        book_resp = self.handler.CreateBook(
            library_pb2.CreateBookRequest(
                title="Test Book",
                author="Test Author"
            ),
            self.ctx
        )
        self.assertIsNotNone(book_resp.book)
        book_id = book_resp.book.id

        session = self.Session()
        copy = BookCopyRepository.create(
            session, book_id, "Copy 1", "available"
        )
        session.close()

        member_resp = self.handler.CreateMember(
            library_pb2.CreateMemberRequest(
                name="Jane Doe",
                email="jane@example.com"
            ),
            self.ctx
        )
        member_id = member_resp.member.id

        borrow_resp = self.handler.BorrowBook(
            library_pb2.BorrowBookRequest(
                copy_id=copy.id,
                member_id=member_id
            ),
            self.ctx
        )
        self.assertIsNotNone(borrow_resp.borrow)
        self.assertEqual(self.ctx._code, None)

        return_resp = self.handler.ReturnBook(
            library_pb2.ReturnBookRequest(copy_id=copy.id),
            self.ctx
        )
        self.assertIsNotNone(return_resp.borrow)
        self.assertEqual(return_resp.borrow.status, "returned")

        list_ctx = MockContext()
        list_ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )
        list_resp = self.handler.ListBorrowings(
            library_pb2.ListBorrowingsRequest(member_id=member_id),
            list_ctx
        )
        self.assertEqual(len(list_resp.borrows), 0)

    def test_get_book_by_id_found(self):
        """GetBook returns book with copy count when found."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        book_resp = self.handler.CreateBook(
            library_pb2.CreateBookRequest(
                title="Get Test Book",
                author="Author"
            ),
            self.ctx
        )
        book_id = book_resp.book.id

        get_resp = self.handler.GetBook(
            library_pb2.GetBookRequest(id=book_id),
            self.ctx
        )
        self.assertIsNone(self.ctx._code)
        self.assertIsNotNone(get_resp.book)
        self.assertEqual(get_resp.book.id, book_id)
        self.assertEqual(get_resp.book.title, "Get Test Book")
        self.assertEqual(get_resp.book.copy_count, 0)

    def test_get_book_by_id_not_found(self):
        """GetBook returns NOT_FOUND when book does not exist."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        fake_id = generate_ulid()
        self.handler.GetBook(
            library_pb2.GetBookRequest(id=fake_id),
            self.ctx
        )
        self.assertEqual(self.ctx._code, grpc.StatusCode.NOT_FOUND)

    def test_get_book_by_id_malformed_returns_invalid_argument(self):
        """GetBook returns INVALID_ARGUMENT for malformed ID."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        self.handler.GetBook(
            library_pb2.GetBookRequest(id="invalid-id"),
            self.ctx
        )
        self.assertEqual(self.ctx._code, grpc.StatusCode.INVALID_ARGUMENT)

    def test_get_member_by_id_found(self):
        """GetMember returns member when found."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        member_resp = self.handler.CreateMember(
            library_pb2.CreateMemberRequest(
                name="Get Test Member",
                email="getmember@example.com"
            ),
            self.ctx
        )
        member_id = member_resp.member.id

        get_resp = self.handler.GetMember(
            library_pb2.GetMemberRequest(id=member_id),
            self.ctx
        )
        self.assertIsNone(self.ctx._code)
        self.assertIsNotNone(get_resp.member)
        self.assertEqual(get_resp.member.id, member_id)
        self.assertEqual(get_resp.member.name, "Get Test Member")

    def test_get_member_by_id_not_found(self):
        """GetMember returns NOT_FOUND when member does not exist."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        fake_id = generate_ulid()
        self.handler.GetMember(
            library_pb2.GetMemberRequest(id=fake_id),
            self.ctx
        )
        self.assertEqual(self.ctx._code, grpc.StatusCode.NOT_FOUND)

    def test_get_member_by_id_malformed_returns_invalid_argument(self):
        """GetMember returns INVALID_ARGUMENT for malformed ID."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        self.handler.GetMember(
            library_pb2.GetMemberRequest(id="bad-id"),
            self.ctx
        )
        self.assertEqual(self.ctx._code, grpc.StatusCode.INVALID_ARGUMENT)

    def test_list_books_with_filter(self):
        """ListBooks with title filter returns matching books."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        self.handler.CreateBook(
            library_pb2.CreateBookRequest(
                title="Python Programming",
                author="Jane Doe"
            ),
            self.ctx
        )
        self.handler.CreateBook(
            library_pb2.CreateBookRequest(
                title="Java Basics",
                author="John Smith"
            ),
            self.ctx
        )

        list_resp = self.handler.ListBooks(
            library_pb2.ListBooksRequest(
                pagination=library_pb2.PaginationRequest(page=1, limit=10),
                title="Python"
            ),
            self.ctx
        )
        self.assertIsNone(self.ctx._code)
        self.assertEqual(len(list_resp.books), 1)
        self.assertIn("Python", list_resp.books[0].title)

    def test_list_members_with_filter(self):
        """ListMembers with name filter returns matching members."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        self.handler.CreateMember(
            library_pb2.CreateMemberRequest(
                name="Alice Johnson",
                email="alice@example.com"
            ),
            self.ctx
        )
        self.handler.CreateMember(
            library_pb2.CreateMemberRequest(
                name="Bob Smith",
                email="bob@example.com"
            ),
            self.ctx
        )

        list_resp = self.handler.ListMembers(
            library_pb2.ListMembersRequest(
                pagination=library_pb2.PaginationRequest(page=1, limit=10),
                name="Alice"
            ),
            self.ctx
        )
        self.assertIsNone(self.ctx._code)
        self.assertEqual(len(list_resp.members), 1)
        self.assertIn("Alice", list_resp.members[0].name)

    def test_borrow_unavailable_copy_fails(self):
        """Borrowing already checked-out copy fails."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        session = self.Session()
        book = BookRepository.create(session, "B", "A")
        copy = BookCopyRepository.create(
            session, book.id, "1", "checked_out"
        )
        member = MemberRepository.create(session, "J", "j@x.com")
        copy_id = copy.id
        member_id = member.id
        session.close()

        borrow_resp = self.handler.BorrowBook(
            library_pb2.BorrowBookRequest(
                copy_id=copy_id,
                member_id=member_id
            ),
            self.ctx
        )
        self.assertEqual(self.ctx._code, grpc.StatusCode.FAILED_PRECONDITION)

    def test_create_book_copy_duplicate_fails(self):
        """CreateBookCopy fails when copy number already exists for book."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        book_resp = self.handler.CreateBook(
            library_pb2.CreateBookRequest(
                title="Dup Test",
                author="A"
            ),
            self.ctx
        )
        book_id = book_resp.book.id

        self.handler.CreateBookCopy(
            library_pb2.CreateBookCopyRequest(
                book_id=book_id,
                copy_number="1"
            ),
            self.ctx
        )
        self.assertEqual(self.ctx._code, None)

        self.ctx._code = None
        self.handler.CreateBookCopy(
            library_pb2.CreateBookCopyRequest(
                book_id=book_id,
                copy_number="1"
            ),
            self.ctx
        )
        self.assertEqual(self.ctx._code, grpc.StatusCode.INVALID_ARGUMENT)

    def test_create_book_copy_success(self):
        """CreateBookCopy creates copy when book exists."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        book_resp = self.handler.CreateBook(
            library_pb2.CreateBookRequest(
                title="Copy Test Book",
                author="Author"
            ),
            self.ctx
        )
        book_id = book_resp.book.id

        create_resp = self.handler.CreateBookCopy(
            library_pb2.CreateBookCopyRequest(
                book_id=book_id,
                copy_number="Copy 1"
            ),
            self.ctx
        )
        self.assertEqual(self.ctx._code, None)
        self.assertIsNotNone(create_resp.copy)
        self.assertEqual(create_resp.copy.book_id, book_id)
        self.assertEqual(create_resp.copy.copy_number, "Copy 1")

    def test_create_book_copy_book_not_found_fails(self):
        """CreateBookCopy fails when book does not exist."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        create_resp = self.handler.CreateBookCopy(
            library_pb2.CreateBookCopyRequest(
                book_id="nonexistent-book-id",
                copy_number="1"
            ),
            self.ctx
        )
        self.assertEqual(self.ctx._code, grpc.StatusCode.NOT_FOUND)

    def test_create_book_copy_requires_auth(self):
        """CreateBookCopy requires authentication."""
        ctx = MockContext()
        create_resp = self.handler.CreateBookCopy(
            library_pb2.CreateBookCopyRequest(
                book_id="some-id",
                copy_number="1"
            ),
            ctx
        )
        self.assertEqual(ctx._code, grpc.StatusCode.UNAUTHENTICATED)

    def test_list_available_copies_success(self):
        """ListAvailableCopies returns available copies with book info."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        session = self.Session()
        book = BookRepository.create(session, "B", "A")
        BookCopyRepository.create(session, book.id, "1", "available")
        session.close()

        req = library_pb2.ListAvailableCopiesRequest()
        req.pagination.page = 1
        req.pagination.limit = 100
        resp = self.handler.ListAvailableCopies(req, self.ctx)
        self.assertEqual(self.ctx._code, None)
        self.assertEqual(len(resp.copies), 1)
        self.assertEqual(resp.copies[0].book_title, "B")
        self.assertEqual(resp.copies[0].copy_number, "1")

    def test_list_available_copies_requires_auth(self):
        """ListAvailableCopies requires authentication."""
        ctx = MockContext()
        req = library_pb2.ListAvailableCopiesRequest()
        req.pagination.page = 1
        req.pagination.limit = 100
        self.handler.ListAvailableCopies(req, ctx)
        self.assertEqual(ctx._code, grpc.StatusCode.UNAUTHENTICATED)

    def test_list_books_returns_copy_count_per_book(self):
        """ListBooks returns correct copy_count for each book."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        session = self.Session()
        book1 = BookRepository.create(session, "Book One", "Author A")
        book2 = BookRepository.create(session, "Book Two", "Author B")
        book1_id = book1.id
        book2_id = book2.id
        BookCopyRepository.create(session, book1_id, "1", "available")
        BookCopyRepository.create(session, book1_id, "2", "checked_out")
        BookCopyRepository.create(session, book1_id, "3", "available")
        session.close()

        req = library_pb2.ListBooksRequest()
        req.pagination.page = 1
        req.pagination.limit = 100
        resp = self.handler.ListBooks(req, self.ctx)
        self.assertEqual(self.ctx._code, None)
        self.assertEqual(len(resp.books), 2)
        book1_resp = next(b for b in resp.books if b.id == book1_id)
        book2_resp = next(b for b in resp.books if b.id == book2_id)
        self.assertEqual(book1_resp.copy_count, 3)
        self.assertEqual(book2_resp.copy_count, 0)

    def test_list_copies_by_book_returns_copies_with_pagination(self):
        """ListCopiesByBook returns copies for book with pagination."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        session = self.Session()
        book = BookRepository.create(session, "Test Book", "Author")
        book_id = book.id
        BookCopyRepository.create(session, book_id, "A", "available")
        BookCopyRepository.create(session, book_id, "B", "checked_out")
        session.close()

        req = library_pb2.ListCopiesByBookRequest()
        req.book_id = book_id
        req.pagination.page = 1
        req.pagination.limit = 100
        resp = self.handler.ListCopiesByBook(req, self.ctx)
        self.assertEqual(self.ctx._code, None)
        self.assertEqual(len(resp.copies), 2)
        self.assertEqual(resp.pagination.total_count, 2)
        copy_numbers = sorted(c.copy_number for c in resp.copies)
        self.assertEqual(copy_numbers, ["A", "B"])

    def test_list_copies_by_book_nonexistent_returns_not_found(self):
        """ListCopiesByBook for non-existent book returns NOT_FOUND."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        req = library_pb2.ListCopiesByBookRequest()
        req.book_id = "nonexistent-book-id"
        req.pagination.page = 1
        req.pagination.limit = 100
        self.handler.ListCopiesByBook(req, self.ctx)
        self.assertEqual(self.ctx._code, grpc.StatusCode.NOT_FOUND)

    def test_list_copies_by_book_zero_copies_returns_empty_list(self):
        """ListCopiesByBook for book with zero copies returns empty list."""
        login_req = auth_pb2.LoginRequest(
            username="staff1",
            password="password123"
        )
        login_resp = self.handler.Login(login_req, self.ctx)
        self.ctx.set_metadata(
            "authorization",
            f"Bearer {login_resp.token}"
        )

        session = self.Session()
        book = BookRepository.create(session, "Empty Book", "Author")
        book_id = book.id
        session.close()

        req = library_pb2.ListCopiesByBookRequest()
        req.book_id = book_id
        req.pagination.page = 1
        req.pagination.limit = 100
        resp = self.handler.ListCopiesByBook(req, self.ctx)
        self.assertEqual(self.ctx._code, None)
        self.assertEqual(len(resp.copies), 0)
        self.assertEqual(resp.pagination.total_count, 0)
