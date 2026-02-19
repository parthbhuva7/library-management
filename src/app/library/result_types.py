"""
Structured result types for library service operations.
"""
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass
class PaginatedResult(Generic[T]):
    """Result of a paginated list operation."""

    items: list[T]
    total_count: int


@dataclass
class ServiceResult(Generic[T]):
    """Result of an operation that may fail (e.g., borrow, return)."""

    success: bool
    data: T | None
    error_message: str | None
