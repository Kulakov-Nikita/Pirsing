from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field
from .enums import SessionStatus


class SessionBase(BaseModel):
    employee_id: str = Field(..., examples=["E12345"]) 
    order_id: str = Field(..., examples=["ORD-12345"]) 


class SessionCreate(SessionBase):
    actual_tools: Optional[List[str]] = None  # temporary solution, will be removed later



class SessionUpdate(BaseModel):
    photo: Optional[str] = None


class SessionOut(SessionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    status: SessionStatus = Field(default=SessionStatus.pending_photo_upload)
    actual_tools: Optional[List[str]] = None
    detected_tools: Optional[List[str]] = None
    photo: Optional[str] = None
    photo_uploaded_at: Optional[datetime] = None
    sent_to_ml_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    order_id: str
    created_at: datetime
    actual_tools: Optional[List[str]] = None
    status: str


