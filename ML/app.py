import io
from typing import List, Dict, Any

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
import numpy as np
from ultralytics import YOLO
from starlette.concurrency import run_in_threadpool

app = FastAPI(title="YOLO detect API")

# Загружаем модель при старте (маленькая модель yolov8n)
# Можно заменить на 'yolov8s.pt' или путь к своей модели
MODEL_PATH = "best.pt"
# Параметры по умолчанию
DEFAULT_CONF = 0.25
DEFAULT_IMGSZ = 640

# Загружаем модель (это блокирующая операция)
model = YOLO(MODEL_PATH)


class BBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_id: int
    class_name: str


def _predict_from_bytes(img_bytes: bytes, conf: float = DEFAULT_CONF, imgsz: int = DEFAULT_IMGSZ) -> List[Dict[str, Any]]:
    """
    Blocking prediction: принимает байты изображения, возвращает список bbox.
    """
    try:
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise RuntimeError(f"can't open image: {e}")

    # ultralytics поддерживает PIL.Image напрямую
    results = model.predict(img, conf=conf, imgsz=imgsz)  # возвращает список Results (обычно длина 1)
    out = []
    # results[0] соответствует первому (и единственному) изображению
    if len(results) == 0:
        return out

    r = results[0]
    # r.boxes содержит координаты в формате xyxy
    # .xyxy, .conf, .cls
    boxes = getattr(r.boxes, "xyxy", None)
    confs = getattr(r.boxes, "conf", None)
    classes = getattr(r.boxes, "cls", None)

    names = getattr(model, "names", None) or {}

    if boxes is None:
        return out

    # boxes is a tensor-like; convert to numpy
    boxes_np = boxes.cpu().numpy() if hasattr(boxes, "cpu") else np.array(boxes)
    confs_np = confs.cpu().numpy() if hasattr(confs, "cpu") else np.array(confs)
    classes_np = classes.cpu().numpy() if hasattr(classes, "cpu") else np.array(classes)

    for i in range(len(boxes_np)):
        x1, y1, x2, y2 = boxes_np[i].tolist()
        confv = float(confs_np[i])
        cls_id = int(classes_np[i])
        cls_name = str(names.get(cls_id, str(cls_id)))
        out.append({
            "x1": float(x1),
            "y1": float(y1),
            "x2": float(x2),
            "y2": float(y2),
            "confidence": confv,
            "class_id": cls_id,
            "class_name": cls_name
        })

    return out


@app.post("/analyze", response_class=JSONResponse)
async def detect(
    file: UploadFile = File(...),
    conf: float = Form(DEFAULT_CONF),
    imgsz: int = Form(DEFAULT_IMGSZ)
):
    """
    Принимает multipart/form-data:
      - file: бинарное изображение
      - conf (optional, form field): confidence threshold (float)
      - imgsz (optional, form field): размер для ресайза модели (int)
    Возвращает JSON: {"bboxes": [ {x1,y1,x2,y2,confidence,class_id,class_name}, ... ] }
    """
    # читаем байты (async I/O)
    try:
        img_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"can't read uploaded file: {e}")

    if not img_bytes:
        raise HTTPException(status_code=400, detail="empty file")

    # модель блокирует, поэтому выполняем в threadpool
    try:
        bboxes = await run_in_threadpool(_predict_from_bytes, img_bytes, float(conf), int(imgsz))
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"prediction failed: {e}")

    return {"bboxes": bboxes}
