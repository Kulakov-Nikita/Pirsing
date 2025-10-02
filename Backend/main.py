from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware   

from app.database import Base, engine
from app.routers import router as sessions_router
from app.routers import orders_router
from fastapi.middleware.cors import CORSMiddleware


def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title="Hackathon Backend", version="0.1.0")
    app.include_router(sessions_router)
    app.include_router(orders_router)
    
    # Set all CORS enabled origins
    origins = [
        # Local
        "http://localhost",
        "http://localhost:8080",
        "http://localhost:8001",

        # Docker
        "http://yolo:8001",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app

app = create_app()
