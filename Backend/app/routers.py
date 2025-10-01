from __future__ import annotations

import os
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session as OrmSession

from .crud import (
    create_session,
    get_session,
    get_sessions,
    update_session,
)
from .database import get_db
from .schemas import SessionCreate, SessionOut, SessionUpdate, OrderOut
from .clients import fetch_orders_by_employee, process_photo_with_ml
from .enums import SessionStatus


router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/", response_model=List[SessionOut])
def list_sessions(
    skip: int = 0,
    limit: int = 100,
    db: OrmSession = Depends(get_db),
):
    return get_sessions(db, skip=skip, limit=limit)


@router.get("/{session_id}", response_model=SessionOut)
def read_session(session_id: int, db: OrmSession = Depends(get_db)):
    db_obj = get_session(db, session_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return db_obj


@router.post("/", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session_endpoint(session_in: SessionCreate, db: OrmSession = Depends(get_db)):
    return create_session(db, session_in)



@router.post("/{session_id}/upload-photo", response_model=SessionOut)
async def upload_photo(
    session_id: int,
    photo: UploadFile = File(...),
    db: OrmSession = Depends(get_db)
):
    """Upload photo and process with ML service."""
    # Get session
    db_session = get_session(db, session_id)
    if not db_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    # Validate file type
    if not photo.content_type or not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")
    
    # Read photo content
    photo_content = await photo.read()

    # Save photo to storage (simple file system for now)
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    photo_path = f"{uploads_dir}/session_{session_id}_{photo.filename}"
    
    with open(photo_path, "wb") as f:
        f.write(photo_content)
    
    # Update session with photo_uploaded_at and status
    now = datetime.utcnow()
    update_data = SessionUpdate(
        photo=photo_path,
        photo_uploaded_at=now,
        status=SessionStatus.photo_uploaded
    )
    db_session = update_session(db, db_session, update_data)
    
    # Update session with sent_to_ml_at before ML processing
    now = datetime.utcnow()
    update_data = SessionUpdate(
        sent_to_ml_at=now,
        status=SessionStatus.sent_to_ml
    )
    db_session = update_session(db, db_session, update_data)
    
    # Process with ML service
    try:
        ml_response = await process_photo_with_ml(photo_content, photo.filename or "photo.jpg")
        detected_tools = ml_response.get("detected_tools", [])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"ML processing failed: {str(e)}")
    
    # Update session with processed_at and final status
    now = datetime.utcnow()
    update_data = SessionUpdate(
        processed_at=now,
        detected_tools=detected_tools,
        status=SessionStatus.processed
    )
    
    return update_session(db, db_session, update_data)


orders_router = APIRouter(prefix="/orders", tags=["orders"])


@orders_router.get("/", response_model=List[OrderOut])
async def list_orders(employee_id: str):
    raw = await fetch_orders_by_employee(employee_id)
    items: List[OrderOut] = []
    for r in raw:
        items.append(
            OrderOut(
                order_id=str(r.get("order_id") or r.get("id")),
                created_at=r.get("created_at"),
                actual_tools=r.get("actual_tools"),
                status=str(r.get("status")),
            )
        )
    return items
