from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session as OrmSession

from . import models, schemas


def get_session(db: OrmSession, session_id: int) -> Optional[models.Session]:
    return db.get(models.Session, session_id)


def get_sessions(db: OrmSession, skip: int = 0, limit: int = 100) -> List[models.Session]:
    return (
        db.query(models.Session)
        .order_by(models.Session.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_session(db: OrmSession, session_in: schemas.SessionCreate) -> models.Session:
    db_obj = models.Session(**session_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_session(
    db: OrmSession, db_obj: models.Session, session_in: schemas.SessionUpdate
) -> models.Session:
    data = session_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_session(db: OrmSession, session_id: int) -> bool:
    db_obj = get_session(db, session_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True



