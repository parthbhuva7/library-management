"""
ULID generation and validation utilities.
"""
from ulid import ULID


def generate_ulid() -> str:
    """
    Generate a new ULID string.

    Returns:
        A 26-character ULID string (time-ordered, URL-safe).
    """
    return str(ULID())


def is_valid_ulid(value: str) -> bool:
    """
    Validate that a string is a valid ULID.

    Args:
        value: String to validate.

    Returns:
        True if valid ULID, False otherwise.
    """
    if not value or len(value) != 26:
        return False
    try:
        ULID.from_str(value)
        return True
    except (ValueError, TypeError):
        return False
