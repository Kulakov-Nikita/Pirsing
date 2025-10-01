## FastAPI + SQLAlchemy Backend (Sessions CRUD)

### Setup

Prerequisite: Python 3.12

1. Create and activate a virtualenv:

```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
uvicorn main:app --reload
```

Environment variable `DATABASE_URL` can be set to use Postgres/MySQL/etc. Defaults to SQLite file `app.db`.

Copy `.env.example` to `.env` and adjust as needed (if present). The app and Alembic will load `.env` automatically; override with `ENV_FILE` env var.

### Endpoints

- `GET /sessions/` — list sessions
- `GET /sessions/{id}` — get session
- `POST /sessions/` — create session
- `PUT /sessions/{id}` — update session
- `DELETE /sessions/{id}` — delete session

Open API docs at `/docs` or `/redoc` when server is running.

### Database migrations (Alembic)

Generate a new migration (autogenerate based on models):

```bash
alembic revision --autogenerate -m "describe changes"
```

Apply migrations:

```bash
alembic upgrade head
```

Downgrade one step:

```bash
alembic downgrade -1
```

Alembic reads the DB URL from `DATABASE_URL` or falls back to `sqlite:///./app.db`.

### Docker

Run with Postgres using docker-compose:

```bash
docker compose up --build
```

The app will be available at `http://localhost:8000` and Postgres at `localhost:5432`.

Compose config sets `DATABASE_URL` to `postgresql+psycopg2://app:app@db:5432/app`.

### External orders client

Configure base URL with `ORDERS_BASE_URL`.

Mock mode (returns built-in sample orders):

```bash
export ORDERS_USE_MOCK=1
```

### ML Service Integration

Configure ML service URL with `ML_SERVICE_URL` (default: `http://localhost:8001`).

Mock ML responses:

```bash
export ML_USE_MOCK=1
```

### Photo Upload

Upload photos to sessions:

```bash
POST /sessions/{session_id}/upload-photo
```

This will:
1. Validate the image file
2. Send to ML service for analysis
3. Update session with `actual_tools` from ML response
4. Set status to `processed`
5. Store photo in `uploads/` directory


