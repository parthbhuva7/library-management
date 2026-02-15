"""
Tests for AuthService.
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
from app.auth.auth_service import AuthService


def get_test_session():
    """Create in-memory SQLite session for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


class TestAuthService(unittest.TestCase):
    """Tests for AuthService."""

    def setUp(self):
        """Create test session and staff user."""
        self.session = get_test_session()
        self.auth_service = AuthService("test-secret-key")
        self.user = StaffUserRepository.create(
            self.session,
            "staff1",
            self.auth_service.hash_password("password123")
        )

    def tearDown(self):
        """Close session."""
        self.session.close()

    def test_login_valid_credentials_returns_token(self):
        """login with valid credentials returns token."""
        result = AuthService.login(
            self.session,
            "staff1",
            "password123",
            "test-secret-key"
        )
        self.assertIsNotNone(result)
        self.assertIn("token", result)
        self.assertIn("expires_at", result)

    def test_login_invalid_password_returns_none(self):
        """login with invalid password returns None."""
        result = AuthService.login(
            self.session,
            "staff1",
            "wrongpassword",
            "test-secret-key"
        )
        self.assertIsNone(result)

    def test_login_nonexistent_user_returns_none(self):
        """login with nonexistent user returns None (no user reveal)."""
        result = AuthService.login(
            self.session,
            "nonexistent",
            "password",
            "test-secret-key"
        )
        self.assertIsNone(result)

    def test_validate_session_valid_token_returns_user_id(self):
        """validate_session with valid token returns user id."""
        login_result = AuthService.login(
            self.session, "staff1", "password123", "test-secret-key"
        )
        user_id = AuthService.validate_session(
            login_result["token"], "test-secret-key"
        )
        self.assertEqual(user_id, self.user.id)

    def test_validate_session_invalid_token_returns_none(self):
        """validate_session with invalid token returns None."""
        user_id = AuthService.validate_session(
            "invalid-token", "test-secret-key"
        )
        self.assertIsNone(user_id)
