# Library Management App

A neighborhood library management system for catalog, members, and lending operations.

## Tech Stack

- **Backend**: Python, gRPC, SQLAlchemy ORM, PostgreSQL
- **Frontend**: Next.js (React)
- **Auth**: JWT, bcrypt

## Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL (or SQLite for development)
- npm or yarn
- docker/podman for envoy proxy (grpc-web)

## Setup

### 1. Python Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database

**PostgreSQL:**

```bash
createdb library_management
export DATABASE_URL="postgresql://localhost:5432/library_management"
cd src && alembic upgrade head
```

**SQLite (development):**

```bash
export DATABASE_URL="sqlite:///library.db"
cd src && alembic upgrade head
```

### 3. Create Staff User

```bash
cd src
python3 -c "
from util.database import get_session
from app.auth.auth_service import AuthService
from app.auth.repository import StaffUserRepository
s = get_session()
auth = AuthService('change-me-in-production')
StaffUserRepository.create(s, 'admin', auth.hash_password('admin123'))
print('Staff user admin/admin123 created')
"
```

### 4. Compile gRPC Protos (if needed)

```bash
./scripts/compile_proto.sh
```

### 5. Run Backend

**gRPC Server (port 50051):**

```bash
cd src
python3 server.py
```

**gRPC-Web Proxy (port 8080, for browser clients):**

```bash
# Script (requires Docker/Podman)
./scripts/run_envoy.sh
```

The Envoy proxy translates gRPC-Web (HTTP/1.1) from the browser to gRPC (HTTP/2) for the backend.

### 6. Generate gRPC-Web Client (frontend)

```bash
cd frontend
npm install
npm run generate:grpc
```

### 7. Run Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://localhost:5432/library_management | Database connection |
| JWT_SECRET | change-me-in-production | JWT signing key |
| SERVER_PORT | 50051 | gRPC server port |

## Architecture

```
Browser (Next.js) → /grpc-web/* → Envoy (8080) → gRPC Server (50051)
```

The frontend uses gRPC-Web exclusively. Next.js rewrites `/grpc-web` to the Envoy proxy.

## API (gRPC / gRPC-Web)

- `Login` - Staff authentication (no auth required)
- `CreateBook`, `UpdateBook`, `ListBooks` - Book catalog
- `CreateMember`, `UpdateMember`, `ListMembers` - Members
- `BorrowBook`, `ReturnBook` - Lending
- `ListBorrowings` - Query current borrowings

All methods except `Login` require `Authorization: Bearer <token>` in metadata.

## Tests

```bash
source .venv/bin/activate
python3 -m pytest test/ -v
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── auth/          # Auth service, StaffUserRepository
│   │   └── library/      # Library repos, service, gRPC handlers
│   ├── models/           # SQLAlchemy models
│   ├── util/              # Database, ULID
│   ├── generated/        # gRPC generated code
│   ├── migrations/       # Alembic migrations
│   └── server.py         # gRPC server
├── proto/                # Protocol Buffer definitions
├── frontend/             # Next.js app
└── test/                 # Tests
```
