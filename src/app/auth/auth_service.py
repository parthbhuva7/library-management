"""
Authentication service with bcrypt and JWT.
"""
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
from sqlalchemy.orm import Session

from app.auth.repository import StaffUserRepository
from models.staff_user import StaffUser

JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


class AuthService:
    """Authentication service for staff login and session validation."""

    def __init__(self, secret_key: str):
        """Initialize with JWT secret key."""
        self.secret_key = secret_key

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt."""
        return bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash."""
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed.encode("utf-8")
        )

    @staticmethod
    def login(
        session: Session,
        username: str,
        password: str,
        secret_key: str
    ) -> dict | None:
        """
        Authenticate staff and return token.

        Returns None for invalid credentials (does not reveal if user exists).
        """
        user = StaffUserRepository.find_by_username(session, username)
        if not user:
            return None
        service = AuthService(secret_key)
        if not service.verify_password(password, user.password_hash):
            return None
        token = AuthService._create_token(user.id, secret_key)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
        return {
            "token": token,
            "expires_at": expires_at.isoformat()
        }

    @staticmethod
    def _create_token(user_id: str, secret_key: str) -> str:
        """Create JWT token for user."""
        payload = {
            "sub": user_id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
            "iat": datetime.now(timezone.utc)
        }
        return jwt.encode(
            payload,
            secret_key,
            algorithm=JWT_ALGORITHM
        )

    @staticmethod
    def validate_session(token: str, secret_key: str) -> str | None:
        """
        Validate JWT token and return user id.

        Returns None if token is invalid or expired.
        """
        try:
            payload = jwt.decode(
                token,
                secret_key,
                algorithms=[JWT_ALGORITHM]
            )
            return payload.get("sub")
        except jwt.PyJWTError:
            return None
