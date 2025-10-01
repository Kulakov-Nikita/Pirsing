from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware   

from app.database import Base, engine
from app.routers import router as sessions_router
from app.routers import orders_router

def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title="Hackathon Backend", version="0.1.0")
    app.include_router(sessions_router)
    app.include_router(orders_router)
 
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app

app = create_app()
