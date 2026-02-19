"""
Tests for library repository search logic (query parameter).
"""
import sys
from pathlib import Path

root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root / "src"))
sys.path.insert(0, str(root / "src" / "generated"))

import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.book import Book
from models.book_copy import BookCopy
from models.member import Member
from models.borrow import Borrow
from util.ulid_util import generate_ulid
from app.library.repository import (
    BookRepository,
    BookCopyRepository,
    MemberRepository,
    BorrowRepository,
)


def get_test_session():
    """Create in-memory SQLite session for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


class TestBookRepositorySearch(unittest.TestCase):
    """Tests for BookRepository query search."""

    def setUp(self):
        """Create test session and books."""
        self.session = get_test_session()
        BookRepository.create(
            self.session, title="Python Guide", author="Jane Doe", isbn="111"
        )
        BookRepository.create(
            self.session, title="Java Basics", author="John Smith", isbn="222"
        )
        BookRepository.create(
            self.session, title="Rust Programming", author="Jane Doe", isbn="333"
        )

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_list_filtered_with_query_searches_title_author_isbn(self):
        """query searches across title, author, isbn (OR, case-insensitive)."""
        result = BookRepository.list_filtered(
            self.session, query="python", limit=10, offset=0
        )
        self.assertEqual(len(result), 1)
        self.assertIn("Python", result[0].title)

    def test_list_filtered_with_query_finds_by_author(self):
        """query finds books by author match."""
        result = BookRepository.list_filtered(
            self.session, query="Jane", limit=10, offset=0
        )
        self.assertEqual(len(result), 2)

    def test_list_filtered_with_query_finds_by_isbn(self):
        """query finds books by isbn match."""
        result = BookRepository.list_filtered(
            self.session, query="222", limit=10, offset=0
        )
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].isbn, "222")

    def test_list_filtered_with_empty_query_returns_all(self):
        """Empty or whitespace query returns all (no filter)."""
        result = BookRepository.list_filtered(
            self.session, query="", limit=10, offset=0
        )
        self.assertEqual(len(result), 3)
        result2 = BookRepository.list_filtered(
            self.session, query="   ", limit=10, offset=0
        )
        self.assertEqual(len(result2), 3)

    def test_count_filtered_with_query(self):
        """count_filtered with query returns correct count."""
        count = BookRepository.count_filtered(
            self.session, query="Doe"
        )
        self.assertEqual(count, 2)


class TestMemberRepositorySearch(unittest.TestCase):
    """Tests for MemberRepository query search."""

    def setUp(self):
        """Create test session and members."""
        self.session = get_test_session()
        MemberRepository.create(
            self.session, name="Alice Brown", email="alice@example.com"
        )
        MemberRepository.create(
            self.session, name="Bob Wilson", email="bob@test.org"
        )

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_list_filtered_with_query_searches_name_and_email(self):
        """query searches name OR email (case-insensitive)."""
        result = MemberRepository.list_filtered(
            self.session, query="alice", limit=10, offset=0
        )
        self.assertEqual(len(result), 1)
        self.assertIn("Alice", result[0].name)

    def test_list_filtered_with_query_finds_by_email(self):
        """query finds members by email match."""
        result = MemberRepository.list_filtered(
            self.session, query="test.org", limit=10, offset=0
        )
        self.assertEqual(len(result), 1)
        self.assertIn("bob", result[0].email.lower())


class TestBorrowRepositorySearch(unittest.TestCase):
    """Tests for BorrowRepository list_active_filtered and count_active_filtered."""

    def setUp(self):
        """Create test session and borrow record."""
        self.session = get_test_session()
        self.book = BookRepository.create(
            self.session, title="Searchable Book", author="Author X"
        )
        self.copy = BookCopyRepository.create(
            self.session, self.book.id, "Copy-1", "checked_out"
        )
        self.member = MemberRepository.create(
            self.session, name="Search Member", email="search@example.com"
        )
        self.borrow = BorrowRepository.create(
            self.session, self.copy.id, self.member.id
        )
        BookCopyRepository.update_status(
            self.session, self.copy.id, "checked_out", commit=True
        )

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_list_active_filtered_finds_by_book_title(self):
        """query finds borrows by book title."""
        result = BorrowRepository.list_active_filtered(
            self.session, query="Searchable", limit=10, offset=0
        )
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].id, self.borrow.id)

    def test_list_active_filtered_finds_by_member_name(self):
        """query finds borrows by member name."""
        result = BorrowRepository.list_active_filtered(
            self.session, query="Search Member", limit=10, offset=0
        )
        self.assertEqual(len(result), 1)

    def test_list_active_filtered_finds_by_copy_number(self):
        """query finds borrows by copy number."""
        result = BorrowRepository.list_active_filtered(
            self.session, query="Copy-1", limit=10, offset=0
        )
        self.assertEqual(len(result), 1)

    def test_count_active_filtered_with_query(self):
        """count_active_filtered returns correct count."""
        count = BorrowRepository.count_active_filtered(
            self.session, query="Searchable"
        )
        self.assertEqual(count, 1)
