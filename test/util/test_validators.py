"""
Tests for validation utilities.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import unittest
from util.ulid_util import generate_ulid
from util.validators import validate_ulid, clamp_pagination
from util.exceptions import ValidationError


class TestValidateUlid(unittest.TestCase):
    """Tests for validate_ulid function."""

    def test_valid_ulid_returns_value(self):
        """Valid ULID should return the value unchanged."""
        ulid = generate_ulid()
        result = validate_ulid(ulid, "book_id")
        self.assertEqual(result, ulid)

    def test_empty_string_raises_validation_error(self):
        """Empty string should raise ValidationError."""
        with self.assertRaises(ValidationError) as ctx:
            validate_ulid("", "book_id")
        self.assertIn("book_id", str(ctx.exception))

    def test_none_raises_validation_error(self):
        """None should raise ValidationError."""
        with self.assertRaises(ValidationError) as ctx:
            validate_ulid(None, "member_id")
        self.assertIn("member_id", str(ctx.exception))

    def test_invalid_format_raises_validation_error(self):
        """Invalid ULID format should raise ValidationError."""
        with self.assertRaises(ValidationError):
            validate_ulid("short", "copy_id")
        with self.assertRaises(ValidationError):
            validate_ulid("0" * 25 + "!", "book_id")


class TestClampPagination(unittest.TestCase):
    """Tests for clamp_pagination function."""

    def test_valid_values_returned_unchanged(self):
        """Valid page and limit should be returned unchanged."""
        page, limit = clamp_pagination(1, 50)
        self.assertEqual(page, 1)
        self.assertEqual(limit, 50)

    def test_page_clamped_to_min_one(self):
        """Page less than 1 should be clamped to 1."""
        page, limit = clamp_pagination(0, 10)
        self.assertEqual(page, 1)
        page, limit = clamp_pagination(-5, 10)
        self.assertEqual(page, 1)

    def test_limit_clamped_to_max_100(self):
        """Limit greater than 100 should be clamped to 100."""
        page, limit = clamp_pagination(1, 200)
        self.assertEqual(limit, 100)
        page, limit = clamp_pagination(1, 500)
        self.assertEqual(limit, 100)

    def test_limit_clamped_to_min_one(self):
        """Limit less than 1 should be clamped to 1."""
        page, limit = clamp_pagination(1, 0)
        self.assertEqual(limit, 1)
        page, limit = clamp_pagination(1, -10)
        self.assertEqual(limit, 1)
