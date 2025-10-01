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
            "employee_id": "E00001",
            "created_at": (now - timedelta(hours=4)).isoformat() + "Z",
            "actual_tools": ["Отвертка Плоская", "Бокорезы"],
            "status": "requested", # requested, in_progress, finished
        },
        {
            "order_id": "ORD-1002",
            "employee_id": "E00001",
            "created_at": (now - timedelta(hours=2)).isoformat() + "Z",
            "actual_tools": ["Отвертка Крестовая"],
            "status": "requested",
        },
        {
            "order_id": "ORD-1003",
            "employee_id": "E00001",
            "created_at": (now - timedelta(hours=2)).isoformat() + "Z",
            "actual_tools": ["Бокорезы"],
            "status": "in_progress",
        },
        {
            "order_id": "ORD-1004",
            "employee_id": "E00001",
            "created_at": (now - timedelta(hours=2)).isoformat() + "Z",
            "actual_tools": ["Коловорот"],
            "status": "in_progress",
        },
        {
            "order_id": "ORD-1005",
            "employee_id": "E00001",
            "created_at": (now - timedelta(hours=2)).isoformat() + "Z",
            "actual_tools": ["Коловорот"],
            "status": "finished",
        },
        {
            "order_id": "ORD-2001",
            "employee_id": "E77777",
            "created_at": (now - timedelta(days=1)).isoformat() + "Z",
            "actual_tools": ["Коловорот", "Разводной ключ"],
            "status": "finished",
        },
        {
            "order_id": "ORD-2002",
            "employee_id": "E77777",
            "created_at": (now - timedelta(days=1)).isoformat() + "Z",
            "actual_tools": ["Коловорот", "Разводной ключ"],
            "status": "requested",
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
        "bboxes": [ 
            {
                "x1": 120.5,
                "y1": 85.2,
                "x2": 245.8,
                "y2": 198.3,
                "confidence": 0.89,
                "class_id": 1,
                "class_name": "Отвертка Плоская"
            },
            {
                "x1": 45.1,
                "y1": 156.7,
                "x2": 89.4,
                "y2": 203.9,
                "confidence": 0.76,
                "class_id": 2,
                "class_name": "Отвертка Крестовая"
            },
            {
                "x1": 300.2,
                "y1": 45.8,
                "x2": 456.7,
                "y2": 189.1,
                "confidence": 0.92,
                "class_id": 11,
                "class_name": "Бокорезы"
            },
            {
                "x1": 78.3,
                "y1": 234.5,
                "x2": 134.6,
                "y2": 287.2,
                "confidence": 0.68,
                "class_id": 4,
                "class_name": "Коловорот"
            },
            {
                "x1": 200.9,
                "y1": 145.3,
                "x2": 267.4,
                "y2": 201.8,
                "confidence": 0.84,
                "class_id": 8,
                "class_name": "Разводной ключ"
            }
        ]
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


