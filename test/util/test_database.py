"""
Tests for database session context manager.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import unittest
from unittest.mock import MagicMock, patch
from util.database import session_context


class TestSessionContext(unittest.TestCase):
    """Tests for session_context context manager."""

    @patch("util.database.SessionLocal")
    def test_yields_session(self, mock_session_local):
        """Context manager should yield a session."""
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session
        with session_context() as session:
            self.assertIs(session, mock_session)

    @patch("util.database.SessionLocal")
    def test_closes_session_on_success(self, mock_session_local):
        """Session should be closed when block completes successfully."""
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session
        with session_context() as session:
            pass
        mock_session.close.assert_called_once()

    @patch("util.database.SessionLocal")
    def test_rollback_and_close_on_exception(self, mock_session_local):
        """Session should rollback and close when exception occurs."""
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session
        with self.assertRaises(ValueError):
            with session_context() as session:
                raise ValueError("test error")
        mock_session.rollback.assert_called_once()
        mock_session.close.assert_called_once()

    @patch("util.database.SessionLocal")
    def test_rollback_called_before_close_on_exception(self, mock_session_local):
        """Rollback should be called before close on exception."""
        call_order = []
        mock_session = MagicMock()

        def track_rollback():
            call_order.append("rollback")

        def track_close():
            call_order.append("close")

        mock_session.rollback.side_effect = track_rollback
        mock_session.close.side_effect = track_close
        mock_session_local.return_value = mock_session

        with self.assertRaises(RuntimeError):
            with session_context():
                raise RuntimeError("fail")
        self.assertEqual(call_order, ["rollback", "close"])
