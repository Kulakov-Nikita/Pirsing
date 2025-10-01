## FastAPI + YOLOv8

### Setup

Prerequisite: Python 3.10

1. Create and activate a virtualenv:

```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
uvicorn app:app --reload
```

### Photo Analize

To analize pohoto:

```bash
curl -X POST "http://localhost:8000/analyze" -F "file=@{path_to_photo}"
```

### Docker

Build Docker Image:

```bash
docker build -t yolo-api .
```

Run Docker Container:

```bash
docker run -p 8000:8000 yolo-api
```

The model will be available at `http://localhost:8000`.