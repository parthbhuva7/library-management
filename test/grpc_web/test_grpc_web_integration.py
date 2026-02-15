"""
Integration tests for gRPC-Web backend flow.

The frontend uses gRPC-Web to call these gRPC handlers via Envoy.
These tests verify the gRPC handlers work correctly (same code path as gRPC-Web).
"""
import sys
from pathlib import Path

root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root / "src"))
sys.path.insert(0, str(root / "src" / "generated"))

import os
import unittest
from app.library.grpc_handlers import LibraryServiceHandler
from app.auth.repository import StaffUserRepository
from app.auth.auth_service import AuthService
from models.base import Base
from util import database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from proto import library_pb2, auth_pb2


class MockContext:
    """Mock gRPC context."""

    def __init__(self):
        self._code = None
        self._details = None
        self._metadata = {}

    def set_code(self, code):
        self._code = code

    def set_details(self, details):
        self._details = details

    def invocation_metadata(self):
        return [(k, v) for k, v in self._metadata.items()]

    def set_metadata(self, key, value):
        self._metadata[key] = value


class TestGrpcWebIntegration(unittest.TestCase):
    """Verify gRPC handlers used by gRPC-Web frontend."""

    def setUp(self):
        os.environ["DATABASE_URL"] = "sqlite:///:memory:"
        os.environ["JWT_SECRET"] = "test-secret"
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        database.engine = self.engine
        database.SessionLocal = sessionmaker(bind=self.engine)
        session = database.SessionLocal()
        auth = AuthService("test-secret")
        StaffUserRepository.create(session, "admin", auth.hash_password("admin123"))
        session.close()
        self.handler = LibraryServiceHandler()
        self.ctx = MockContext()

    def test_login_via_grpc_returns_token(self):
        """Login (called via gRPC-Web from frontend) returns token."""
        req = auth_pb2.LoginRequest(username="admin", password="admin123")
        resp = self.handler.Login(req, self.ctx)
        self.assertIsNone(self.ctx._code)
        self.assertTrue(len(resp.token) > 0)

    def test_list_books_with_auth(self):
        """ListBooks with auth token (gRPC-Web flow)."""
        req = auth_pb2.LoginRequest(username="admin", password="admin123")
        resp = self.handler.Login(req, self.ctx)
        self.ctx.set_metadata("authorization", f"Bearer {resp.token}")
        list_req = library_pb2.ListBooksRequest()
        list_req.pagination.page = 1
        list_req.pagination.limit = 100
        list_resp = self.handler.ListBooks(list_req, self.ctx)
        self.assertIsNone(self.ctx._code)
        self.assertGreaterEqual(len(list_resp.books), 0)
