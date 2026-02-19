"""
Validation utilities for the library management system.
"""
from util.exceptions import ValidationError
from util.ulid_util import is_valid_ulid

MIN_PAGE = 1
MAX_LIMIT = 100


def validate_ulid(value: str | None, field_name: str = "id") -> str:
    """
    Validate that a value is a valid ULID.

    Args:
        value: The value to validate.
        field_name: Name of the field for error messages.

    Returns:
        The validated ULID string.

    Raises:
        ValidationError: If value is None, empty, or invalid ULID format.
    """
    if value is None:
        raise ValidationError(f"{field_name} is required")
    if isinstance(value, str) and not value.strip():
        raise ValidationError(f"{field_name} is required")
    if not is_valid_ulid(value):
        raise ValidationError(f"{field_name} has invalid format")
    return value


def clamp_pagination(page: int, limit: int) -> tuple[int, int]:
    """
    Clamp pagination parameters to valid range.

    Args:
        page: Page number (1-based).
        limit: Number of items per page.

    Returns:
        Tuple of (clamped_page, clamped_limit).
        page is clamped to >= 1, limit to 1-100.
    """
    clamped_page = max(MIN_PAGE, page)
    clamped_limit = max(1, min(limit, MAX_LIMIT))
    return clamped_page, clamped_limit
