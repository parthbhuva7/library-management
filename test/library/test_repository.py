"""
Tests for library repositories.
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


class TestBookRepository(unittest.TestCase):
    """Tests for BookRepository."""

    def setUp(self):
        """Create test session."""
        self.session = get_test_session()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_find_by_id_returns_book(self):
        """find_by_id returns book when exists."""
        book = Book(
            id=generate_ulid(),
            title="Test",
            author="Author"
        )
        self.session.add(book)
        self.session.commit()
        result = BookRepository.find_by_id(self.session, book.id)
        self.assertIsNotNone(result)
        self.assertEqual(result.title, "Test")

    def test_find_by_id_returns_none_when_not_found(self):
        """find_by_id returns None when book does not exist."""
        result = BookRepository.find_by_id(self.session, "nonexistent")
        self.assertIsNone(result)

    def test_create_returns_book(self):
        """create returns new book with generated id."""
        result = BookRepository.create(
            self.session,
            title="New Book",
            author="New Author",
            isbn="123"
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.title, "New Book")
        self.assertEqual(len(result.id), 26)

    def test_update_modifies_book(self):
        """update modifies existing book."""
        book = BookRepository.create(
            self.session, title="Original", author="Author"
        )
        updated = BookRepository.update(
            self.session, book.id, title="Updated"
        )
        self.assertEqual(updated.title, "Updated")


class TestBookCopyRepository(unittest.TestCase):
    """Tests for BookCopyRepository."""

    def setUp(self):
        """Create test session and book."""
        self.session = get_test_session()
        self.book = BookRepository.create(
            self.session, title="Test", author="Author"
        )

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_find_available_copies_returns_only_available(self):
        """find_available_copies returns only copies with status available."""
        copy1 = BookCopyRepository.create(
            self.session, self.book.id, "1", "available"
        )
        copy2 = BookCopyRepository.create(
            self.session, self.book.id, "2", "checked_out"
        )
        result = BookCopyRepository.find_available_copies(
            self.session, self.book.id
        )
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].id, copy1.id)

    def test_find_by_id_with_lock_returns_copy(self):
        """find_by_id_with_lock returns copy for pessimistic locking."""
        copy = BookCopyRepository.create(
            self.session, self.book.id, "1", "available"
        )
        result = BookCopyRepository.find_by_id_with_lock(
            self.session, copy.id
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.id, copy.id)

    def test_list_all_available_with_book_returns_copies_with_book_title(self):
        """list_all_available_with_book returns available copies with book."""
        copy1 = BookCopyRepository.create(
            self.session, self.book.id, "1", "available"
        )
        BookCopyRepository.create(
            self.session, self.book.id, "2", "checked_out"
        )
        result = BookCopyRepository.list_all_available_with_book(
            self.session, limit=10, offset=0
        )
        self.assertEqual(len(result), 1)
        copy, book = result[0]
        self.assertEqual(copy.id, copy1.id)
        self.assertEqual(book.title, "Test")

    def test_find_by_book_and_copy_number_returns_copy_when_exists(self):
        """find_by_book_and_copy_number returns copy when exists."""
        BookCopyRepository.create(
            self.session, self.book.id, "Copy-A", "available"
        )
        result = BookCopyRepository.find_by_book_and_copy_number(
            self.session, self.book.id, "Copy-A"
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.copy_number, "Copy-A")

    def test_find_by_book_and_copy_number_returns_none_when_not_exists(self):
        """find_by_book_and_copy_number returns None when not exists."""
        result = BookCopyRepository.find_by_book_and_copy_number(
            self.session, self.book.id, "Nonexistent"
        )
        self.assertIsNone(result)

    def test_count_by_book_id_returns_zero_when_no_copies(self):
        """count_by_book_id returns 0 when book has no copies."""
        result = BookCopyRepository.count_by_book_id(
            self.session, self.book.id
        )
        self.assertEqual(result, 0)

    def test_count_by_book_id_returns_correct_count(self):
        """count_by_book_id returns count of all copies for book."""
        BookCopyRepository.create(
            self.session, self.book.id, "1", "available"
        )
        BookCopyRepository.create(
            self.session, self.book.id, "2", "checked_out"
        )
        BookCopyRepository.create(
            self.session, self.book.id, "3", "available"
        )
        result = BookCopyRepository.count_by_book_id(
            self.session, self.book.id
        )
        self.assertEqual(result, 3)

    def test_list_by_book_id_returns_empty_when_no_copies(self):
        """list_by_book_id returns empty list when book has no copies."""
        result = BookCopyRepository.list_by_book_id(
            self.session, self.book.id, limit=10, offset=0
        )
        self.assertEqual(result, [])

    def test_list_by_book_id_returns_all_copies_for_book(self):
        """list_by_book_id returns copies ordered by copy_number."""
        copy1 = BookCopyRepository.create(
            self.session, self.book.id, "B", "available"
        )
        copy2 = BookCopyRepository.create(
            self.session, self.book.id, "A", "checked_out"
        )
        copy3 = BookCopyRepository.create(
            self.session, self.book.id, "C", "available"
        )
        result = BookCopyRepository.list_by_book_id(
            self.session, self.book.id, limit=10, offset=0
        )
        self.assertEqual(len(result), 3)
        self.assertEqual(result[0].copy_number, "A")
        self.assertEqual(result[1].copy_number, "B")
        self.assertEqual(result[2].copy_number, "C")

    def test_list_by_book_id_respects_pagination(self):
        """list_by_book_id respects limit and offset."""
        for i in range(5):
            BookCopyRepository.create(
                self.session, self.book.id, str(i), "available"
            )
        result = BookCopyRepository.list_by_book_id(
            self.session, self.book.id, limit=2, offset=1
        )
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].copy_number, "1")
        self.assertEqual(result[1].copy_number, "2")

    def test_list_by_book_id_returns_only_copies_for_specified_book(self):
        """list_by_book_id returns only copies for the specified book."""
        other_book = BookRepository.create(
            self.session, title="Other", author="Other"
        )
        BookCopyRepository.create(
            self.session, self.book.id, "1", "available"
        )
        BookCopyRepository.create(
            self.session, other_book.id, "1", "available"
        )
        result = BookCopyRepository.list_by_book_id(
            self.session, self.book.id, limit=10, offset=0
        )
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].book_id, self.book.id)


class TestMemberRepository(unittest.TestCase):
    """Tests for MemberRepository."""

    def setUp(self):
        """Create test session."""
        self.session = get_test_session()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_create_and_find_by_id(self):
        """create and find_by_id work correctly."""
        member = MemberRepository.create(
            self.session, name="Jane", email="jane@example.com"
        )
        result = MemberRepository.find_by_id(self.session, member.id)
        self.assertEqual(result.email, "jane@example.com")


class TestBorrowRepository(unittest.TestCase):
    """Tests for BorrowRepository."""

    def setUp(self):
        """Create test session and entities."""
        self.session = get_test_session()
        self.book = BookRepository.create(
            self.session, title="Test", author="Author"
        )
        self.copy = BookCopyRepository.create(
            self.session, self.book.id, "1", "available"
        )
        self.member = MemberRepository.create(
            self.session, name="Jane", email="jane@example.com"
        )

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_find_active_by_copy_id_returns_none_when_available(self):
        """find_active_by_copy_id returns None when copy not borrowed."""
        result = BorrowRepository.find_active_by_copy_id(
            self.session, self.copy.id
        )
        self.assertIsNone(result)

    def test_create_borrow_and_find_active(self):
        """create creates borrow and find_active_by_copy_id finds it."""
        borrow = BorrowRepository.create(
            self.session, self.copy.id, self.member.id
        )
        result = BorrowRepository.find_active_by_copy_id(
            self.session, self.copy.id
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.id, borrow.id)
