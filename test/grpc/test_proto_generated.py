"""
Tests that generated gRPC code can be imported and used.
"""
import sys
from pathlib import Path

root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root / "src"))
sys.path.insert(0, str(root / "src" / "generated"))

import unittest
from generated.proto import library_pb2, auth_pb2, library_service_pb2
from generated.proto import library_service_pb2_grpc


class TestProtoImports(unittest.TestCase):
    """Verify generated proto modules are importable."""

    def test_library_pb2_imports(self):
        """Library proto messages can be instantiated."""
        book = library_pb2.Book(
            id="01ABC123",
            title="Test",
            author="Author"
        )
        self.assertEqual(book.title, "Test")

    def test_auth_pb2_imports(self):
        """Auth proto messages can be instantiated."""
        req = auth_pb2.LoginRequest(username="user", password="pass")
        self.assertEqual(req.username, "user")

    def test_library_service_stub_exists(self):
        """LibraryServiceStub and Servicer exist."""
        self.assertTrue(hasattr(library_service_pb2_grpc, "LibraryServiceStub"))
        self.assertTrue(hasattr(library_service_pb2_grpc, "LibraryServiceServicer"))

    def test_pagination_messages(self):
        """Pagination request/response exist."""
        pag_req = library_pb2.PaginationRequest(page=1, limit=100)
        self.assertEqual(pag_req.page, 1)
        self.assertEqual(pag_req.limit, 100)
