from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Any, Dict, List

import httpx


ORDERS_SERVICE_URL = os.getenv("ORDERS_SERVICE_URL", "mock")
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "mock")


def _mock_orders_response() -> List[Dict[str, Any]]:
    now = datetime.utcnow()
    return [
        {
            "order_id": "ORD-1001",
            "employee_id": "E12345",
            "created_at": (now - timedelta(hours=4)).isoformat() + "Z",
            "actual_tools": ["hammer", "wrench"],
            "status": "processed",
        },
        {
            "order_id": "ORD-1002",
            "employee_id": "E12345",
            "created_at": (now - timedelta(hours=2)).isoformat() + "Z",
            "actual_tools": ["screwdriver"],
            "status": "sent_to_ml",
        },
        {
            "order_id": "ORD-2001",
            "employee_id": "E77777",
            "created_at": (now - timedelta(days=1)).isoformat() + "Z",
            "actual_tools": [],
            "status": "photo_uploaded",
        },
    ]


async def fetch_orders_by_employee(employee_id: str) -> List[Dict[str, Any]]:
    if ORDERS_SERVICE_URL == "mock":
        return [o for o in _mock_orders_response() if o.get("employee_id") == employee_id]

    url = f"{ORDERS_SERVICE_URL}/orders"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params={"employee_id": employee_id})
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict) and "items" in data:
            return data["items"]
        if isinstance(data, list):
            return data
        return []


def _mock_ml_response() -> Dict[str, Any]:
    return {
        "detected_tools": [
            {"name": "hammer", "confidence": 0.95},
            {"name": "screwdriver", "confidence": 0.87},
            {"name": "wrench", "confidence": 0.92}
        ],
        "processing_time": 1.2
    }


async def process_photo_with_ml(photo_content: bytes, filename: str) -> Dict[str, Any]:
    """Send photo to ML service and get actual_tools response."""
    if ML_SERVICE_URL == "mock":
        return _mock_ml_response()
    
    url = f"{ML_SERVICE_URL}/analyze"
    files = {"photo": (filename, photo_content, "image/jpeg")}
    
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(url, files=files)
        resp.raise_for_status()
        return resp.json()


