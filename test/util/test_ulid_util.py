"""
Tests for ULID utility functions.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import unittest
from util.ulid_util import generate_ulid, is_valid_ulid


class TestGenerateUlid(unittest.TestCase):
    """Tests for generate_ulid function."""

    def test_generates_26_character_string(self):
        """ULID should be 26 characters."""
        ulid = generate_ulid()
        self.assertEqual(len(ulid), 26)

    def test_generates_url_safe_characters(self):
        """ULID should contain only Crockford base32 characters."""
        ulid = generate_ulid()
        valid_chars = set("0123456789ABCDEFGHJKMNPQRSTVWXYZ")
        for char in ulid:
            self.assertIn(char.upper(), valid_chars)

    def test_generates_unique_values(self):
        """Each call should generate a unique ULID."""
        ulids = [generate_ulid() for _ in range(100)]
        self.assertEqual(len(ulids), len(set(ulids)))


class TestIsValidUlid(unittest.TestCase):
    """Tests for is_valid_ulid function."""

    def test_valid_ulid_returns_true(self):
        """Valid ULID string returns True."""
        ulid = generate_ulid()
        self.assertTrue(is_valid_ulid(ulid))

    def test_invalid_length_returns_false(self):
        """String with wrong length returns False."""
        self.assertFalse(is_valid_ulid(""))
        self.assertFalse(is_valid_ulid("short"))
        self.assertFalse(is_valid_ulid("a" * 30))

    def test_invalid_characters_returns_false(self):
        """String with invalid characters returns False."""
        self.assertFalse(is_valid_ulid("0" * 25 + "!"))
        self.assertFalse(is_valid_ulid("0" * 25 + " "))
