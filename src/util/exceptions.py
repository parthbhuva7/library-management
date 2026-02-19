"""
Custom domain exceptions for the library management system.
"""


class LibraryException(Exception):
    """Base exception for library domain errors."""

    def __init__(self, message: str, cause: Exception | None = None):
        super().__init__(message)
        self.message = message
        self.cause = cause


class ResourceNotFound(LibraryException):
    """Raised when a requested resource does not exist."""


class ValidationError(LibraryException):
    """Raised when input validation fails."""


class ConflictError(LibraryException):
    """Raised when an operation conflicts with current state."""


class DatabaseError(LibraryException):
    """Raised when a database operation fails."""
