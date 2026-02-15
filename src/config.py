"""Application configuration from environment variables."""

import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://localhost:5432/library_management"
)
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
SERVER_PORT = int(os.getenv("SERVER_PORT", "50051"))
