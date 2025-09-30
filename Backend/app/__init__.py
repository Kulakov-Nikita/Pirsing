from __future__ import annotations

import os

try:
    from dotenv import load_dotenv

    load_dotenv(os.getenv("ENV_FILE", ".env"))
except Exception:
    pass

__all__ = ["database", "models", "schemas", "crud"]



