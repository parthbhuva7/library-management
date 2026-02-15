"""
Tests for StaffUserRepository.
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
from app.auth.repository import StaffUserRepository


def get_test_session():
    """Create in-memory SQLite session for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


class TestStaffUserRepository(unittest.TestCase):
    """Tests for StaffUserRepository."""

    def setUp(self):
        """Create test session."""
        self.session = get_test_session()

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_find_by_username_returns_user(self):
        """find_by_username returns user when exists."""
        user = StaffUserRepository.create(
            self.session, "staff1", "hashed_password"
        )
        result = StaffUserRepository.find_by_username(
            self.session, "staff1"
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.username, "staff1")

    def test_find_by_username_returns_none_when_not_found(self):
        """find_by_username returns None when user does not exist."""
        result = StaffUserRepository.find_by_username(
            self.session, "nonexistent"
        )
        self.assertIsNone(result)
