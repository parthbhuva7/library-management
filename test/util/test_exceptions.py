"""
Tests for custom exception classes.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import unittest
from util.exceptions import (
    ResourceNotFound,
    ValidationError,
    ConflictError,
    DatabaseError,
)


class TestResourceNotFound(unittest.TestCase):
    """Tests for ResourceNotFound exception."""

    def test_creates_with_message(self):
        """Exception should store message."""
        exc = ResourceNotFound("Book not found")
        self.assertEqual(str(exc), "Book not found")

    def test_inherits_from_base_exception(self):
        """Should be catchable as Exception."""
        exc = ResourceNotFound("Member not found")
        self.assertIsInstance(exc, Exception)


class TestValidationError(unittest.TestCase):
    """Tests for ValidationError exception."""

    def test_creates_with_message(self):
        """Exception should store message."""
        exc = ValidationError("Invalid ULID format")
        self.assertEqual(str(exc), "Invalid ULID format")

    def test_inherits_from_base_exception(self):
        """Should be catchable as Exception."""
        exc = ValidationError("Invalid email")
        self.assertIsInstance(exc, Exception)


class TestConflictError(unittest.TestCase):
    """Tests for ConflictError exception."""

    def test_creates_with_message(self):
        """Exception should store message."""
        exc = ConflictError("Copy number already exists")
        self.assertEqual(str(exc), "Copy number already exists")

    def test_inherits_from_base_exception(self):
        """Should be catchable as Exception."""
        exc = ConflictError("Duplicate email")
        self.assertIsInstance(exc, Exception)


class TestDatabaseError(unittest.TestCase):
    """Tests for DatabaseError exception."""

    def test_creates_with_message(self):
        """Exception should store message."""
        exc = DatabaseError("Connection failed")
        self.assertEqual(str(exc), "Connection failed")

    def test_can_wrap_original_exception(self):
        """Can optionally wrap cause."""
        cause = ValueError("original")
        exc = DatabaseError("DB failed", cause=cause)
        self.assertEqual(str(exc), "DB failed")
        self.assertIs(exc.cause, cause)
