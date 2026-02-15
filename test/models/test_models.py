"""
Tests for SQLAlchemy models.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.book import Book
from models.book_copy import BookCopy
from models.member import Member
from models.borrow import Borrow
from models.staff_user import StaffUser
from util.ulid_util import generate_ulid


def get_test_session():
    """Create in-memory SQLite session for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


class TestBookModel(unittest.TestCase):
    """Tests for Book model."""

    def setUp(self):
        """Create test session."""
        self.session = get_test_session()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_create_book_with_required_fields(self):
        """Book can be created with title and author."""
        book = Book(
            id=generate_ulid(),
            title="The Great Gatsby",
            author="F. Scott Fitzgerald"
        )
        self.session.add(book)
        self.session.commit()
        self.assertIsNotNone(book.id)
        self.assertEqual(book.title, "The Great Gatsby")
        self.assertEqual(book.author, "F. Scott Fitzgerald")
        self.assertIsNone(book.isbn)

    def test_create_book_with_optional_isbn(self):
        """Book can be created with optional ISBN."""
        book = Book(
            id=generate_ulid(),
            title="Test",
            author="Author",
            isbn="978-0-123456-78-9"
        )
        self.session.add(book)
        self.session.commit()
        self.assertEqual(book.isbn, "978-0-123456-78-9")


class TestBookCopyModel(unittest.TestCase):
    """Tests for BookCopy model."""

    def setUp(self):
        """Create test session and book."""
        self.session = get_test_session()
        self.book = Book(
            id=generate_ulid(),
            title="Test Book",
            author="Test Author"
        )
        self.session.add(self.book)
        self.session.commit()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_create_copy_with_status(self):
        """BookCopy can be created with status."""
        copy = BookCopy(
            id=generate_ulid(),
            book_id=self.book.id,
            copy_number="Copy 1",
            status="available"
        )
        self.session.add(copy)
        self.session.commit()
        self.assertEqual(copy.status, "available")
        self.assertEqual(copy.book_id, self.book.id)


class TestMemberModel(unittest.TestCase):
    """Tests for Member model."""

    def setUp(self):
        """Create test session."""
        self.session = get_test_session()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_create_member_with_name_and_email(self):
        """Member can be created with name and email only."""
        member = Member(
            id=generate_ulid(),
            name="John Doe",
            email="john@example.com"
        )
        self.session.add(member)
        self.session.commit()
        self.assertEqual(member.name, "John Doe")
        self.assertEqual(member.email, "john@example.com")


class TestBorrowModel(unittest.TestCase):
    """Tests for Borrow model."""

    def setUp(self):
        """Create test session and related entities."""
        self.session = get_test_session()
        self.book = Book(
            id=generate_ulid(),
            title="Test",
            author="Author"
        )
        self.copy = BookCopy(
            id=generate_ulid(),
            book_id=self.book.id,
            copy_number="1",
            status="checked_out"
        )
        self.member = Member(
            id=generate_ulid(),
            name="Jane",
            email="jane@example.com"
        )
        self.session.add_all([self.book, self.copy, self.member])
        self.session.commit()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_create_borrow_with_active_status(self):
        """Borrow can be created with active status."""
        borrow = Borrow(
            id=generate_ulid(),
            copy_id=self.copy.id,
            member_id=self.member.id,
            status="active"
        )
        self.session.add(borrow)
        self.session.commit()
        self.assertIsNotNone(borrow.borrowed_at)
        self.assertIsNone(borrow.returned_at)
        self.assertEqual(borrow.status, "active")


class TestStaffUserModel(unittest.TestCase):
    """Tests for StaffUser model."""

    def setUp(self):
        """Create test session."""
        self.session = get_test_session()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_create_staff_user(self):
        """StaffUser can be created with username and password."""
        staff = StaffUser(
            id=generate_ulid(),
            username="staff1",
            password_hash="hashed"
        )
        self.session.add(staff)
        self.session.commit()
        self.assertEqual(staff.username, "staff1")
        self.assertEqual(staff.password_hash, "hashed")
