"""
Tests for structured result types.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import unittest
from app.library.result_types import PaginatedResult, ServiceResult


class TestPaginatedResult(unittest.TestCase):
    """Tests for PaginatedResult dataclass."""

    def test_creates_with_items_and_total(self):
        """Should store items and total_count."""
        items = [1, 2, 3]
        result = PaginatedResult(items=items, total_count=10)
        self.assertEqual(result.items, items)
        self.assertEqual(result.total_count, 10)

    def test_empty_list_valid(self):
        """Empty items list with total 0 is valid."""
        result = PaginatedResult(items=[], total_count=0)
        self.assertEqual(result.items, [])
        self.assertEqual(result.total_count, 0)


class TestServiceResult(unittest.TestCase):
    """Tests for ServiceResult dataclass."""

    def test_success_result(self):
        """Success result has data and no error."""
        data = {"id": "123"}
        result = ServiceResult(success=True, data=data, error_message=None)
        self.assertTrue(result.success)
        self.assertEqual(result.data, data)
        self.assertIsNone(result.error_message)

    def test_failure_result(self):
        """Failure result has error message."""
        result = ServiceResult(
            success=False,
            data=None,
            error_message="Copy not found"
        )
        self.assertFalse(result.success)
        self.assertIsNone(result.data)
        self.assertEqual(result.error_message, "Copy not found")
