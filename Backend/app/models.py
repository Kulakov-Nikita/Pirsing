from __future__ import annotations

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from .database import Base
from .enums import SessionStatus


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    order_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=SessionStatus.pending_photo_upload.value
    )

    # Timestamps for processing milestones
    photo_uploaded_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_to_ml_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), nullable=True)
    processed_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), nullable=True)

    # Photo path or URL
    photo: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    actual_tools: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    detected_tools: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


