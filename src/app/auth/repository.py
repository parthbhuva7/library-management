"""
Authentication data access layer.
"""
from sqlalchemy.orm import Session

from models.staff_user import StaffUser
from util.ulid_util import generate_ulid


class StaffUserRepository:
    """Repository for StaffUser operations."""

    @staticmethod
    def find_by_id(session: Session, user_id: str) -> StaffUser | None:
        """Find a staff user by ID."""
        return session.get(StaffUser, user_id)

    @staticmethod
    def find_by_username(
        session: Session,
        username: str
    ) -> StaffUser | None:
        """Find a staff user by username."""
        return (
            session.query(StaffUser)
            .filter(StaffUser.username == username)
            .first()
        )

    @staticmethod
    def create(
        session: Session,
        username: str,
        password_hash: str
    ) -> StaffUser:
        """Create a new staff user."""
        user = StaffUser(
            id=generate_ulid(),
            username=username,
            password_hash=password_hash
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
