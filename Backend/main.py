from __future__ import annotations

from fastapi import FastAPI

from app.database import Base, engine
from app.routers import router as sessions_router
from app.routers import orders_router


def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title="Hackathon Backend", version="0.1.0")
    app.include_router(sessions_router)
    app.include_router(orders_router)
    return app


app = create_app()



