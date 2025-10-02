from __future__ import annotations

from enum import Enum


class SessionStatus(str, Enum):
    pending_photo_upload = "pending_photo_upload"
    photo_uploaded = "photo_uploaded"
    sent_to_ml = "sent_to_ml"
    processed = "processed"
