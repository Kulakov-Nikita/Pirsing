# Pirsing - AI-Powered Tool Recognition System

A comprehensive system for recognizing and managing tools using computer vision and machine learning. The project consists of a React frontend, FastAPI backend, and YOLOv8-based ML service for tool detection.

Hosted: http://pirsiing.duckdns.org/

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   ML Service    │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (YOLOv8)      │
│   Port: 80      │    │   Port: 8000    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Port: 5432    │
                       └─────────────────┘
```

### Диаграмма последовательностей
![UML Diagram](docs/image%20(12).png)
*Последовательность действий и их взаимодействия с сервисами*

### Use-cases
![Use-cases](docs/image%20(13).png)
*Возможные разветвления логики*

### Классовая диаграмма
![Classes](docs/image%20(14).png)
*Database structure and relationships*

### Классовая диаграмма
![ML Pipeline](docs/image%20(15).png)
*Machine learning processing pipeline*

### Диаграмма развертывания
![API Integration](docs/image%20(16).png)
*API communication patterns between services*

### Диаграмма активности
![Deployment Architecture](docs/image%20(17).png)
*Production deployment and scaling architecture*

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.10+ (for local backend development)

### Running with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pirsing
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8000
   - ML Service: http://localhost:8001
   - API Documentation: http://localhost:8000/docs

### How to Test
1. Go to http://pirsiing.duckdns.org/ or in case of local setup to http://localhost/.

2. Follow the instructions in interface. **For test, you can use E00001 as employee's TOIR number**.

#### Step-by-Step Visual Guide

**Step 1: Application Homepage**
![Application Homepage](docs/photo_2025-10-02%2021.06.12.jpeg)
*Initial application interface showing the main entry point*

**Step 2: Employee ID Input**
![Employee ID Input](docs/photo_2025-10-02%2021.06.15.jpeg)
*Enter employee ID (use E00001 for testing)*

**Step 3: Order Type Selection**
![Order Selection](docs/photo_2025-10-02%2021.06.19.jpeg)
*Select an type of order from the available list: get or return instruments.*

**Step 4: Order Selection**
![Order Selection](docs/photo_2025-10-02%2021.06.22.jpeg)
*Select an order from the available list*

**Step 5: Photo Capture Interface**
![Photo Capture](docs/photo_2025-10-02%2021.06.26.jpeg)
*Camera interface for capturing tool photos*

**Step 6: Tool Recognition Results**
![Recognition Results](docs/photo_2025-10-02%2021.06.29.jpeg)
*AI-powered tool detection and recognition results*


## 📁 Project Structure

```
Pirsing/
├── Backend/                 # FastAPI backend service
│   ├── app/
│   │   ├── models.py        # Database models
│   │   ├── routers.py       # API endpoints
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── clients.py       # External service clients
│   │   └── database.py      # Database configuration
│   ├── alembic/             # Database migrations
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
├── Frontend/                # React frontend
│   ├── src/
│   │   ├── view/           # React components
│   │   ├── utils.ts        # API utilities
│   │   └── App.tsx         # Main application
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile          # Frontend container
├── ML/                      # YOLOv8 ML service
│   ├── app.py              # FastAPI ML service
│   ├── best.pt             # Trained YOLO model
│   └── requirements.txt    # ML dependencies
└── docker-compose.yml      # Multi-service orchestration
```

## 🔧 Services Overview



### Backend Service (FastAPI)
- **Port**: 8000
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Features**:
  - Session management
  - Photo upload and processing
  - Order management
  - ML service integration
  - Database migrations with Alembic

**Key Endpoints**:
- `GET /sessions/` - List all sessions
- `POST /sessions/` - Create new session
- `POST /sessions/{id}/upload-photo` - Upload photo for analysis
- `GET /orders/` - Get orders by employee ID

### ML Service (YOLOv8)
- **Port**: 8001
- **Model**: Custom YOLOv8 trained on tool dataset
- **Features**:
  - Real-time tool detection
  - Confidence scoring
  - Bounding box coordinates
  - Tool classification

**Key Endpoints**:
- `POST /analyze` - Analyze uploaded photo for tools

### Frontend Service (React)
- **Port**: 80
- **Features**:
  - Photo capture (camera/gallery)
  - Real-time tool recognition
  - Session management
  - Order tracking

## 🛠️ Development Setup

### Backend Development

1. **Navigate to backend directory**
   ```bash
   cd Backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   # For PostgreSQL (recommended)
   export DATABASE_URL="postgresql+psycopg2://app:app@localhost:5432/app"
   
   # For SQLite (development)
   export DATABASE_URL="sqlite:///./app.db"
   ```

5. **Run migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

### ML Service Development

1. **Navigate to ML directory**
   ```bash
   cd ML
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the service**
   ```bash
   uvicorn app:app --reload --port 8001
   ```

## 🔄 API Integration

### Backend ↔ ML Service
The backend communicates with the ML service for photo analysis:

```python
# Backend sends photo to ML service
ml_response = await process_photo_with_ml(photo_content, filename)
detected_tools = ml_response.get("bboxes", [])
```

### Frontend ↔ Backend
The frontend communicates with the backend for session management:

```typescript
// Frontend creates session
const response = await fetch(`${domain}/sessions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        employee_id: employeeId,
        order_id: order.order_id,
        actual_tools: order.actual_tools
    })
});
```

## 🗄️ Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_photo_upload',
    photo_uploaded_at TIMESTAMP WITH TIME ZONE,
    sent_to_ml_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    photo VARCHAR(1024),
    actual_tools JSON,
    detected_tools JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Configuration

### Environment Variables

**Backend**:
- `DATABASE_URL`: Database connection string
- `ORDERS_SERVICE_URL`: External orders service URL (or "mock")
- `ML_SERVICE_URL`: ML service URL (default: http://yolo:8001)

**Frontend**:
- `BACKEND_SERVICE_URL`: Backend API URL

**ML Service**:
- `MODEL_PATH`: Path to YOLO model file (default: "best.pt")
- `DEFAULT_CONF`: Confidence threshold (default: 0.25)
- `DEFAULT_IMGSZ`: Image size for processing (default: 640)

## 📊 ML Model Details

### Supported Tools
The YOLOv8 model is trained to detect the following tools:
- Отвертка - 
- Отвертка + 
- Отвертка на смещенный крест 
- Ключ рожковыйнакидной 
- Бокорезы 
- Коловорот 
- Пассатижи 
- Пассатижи контровочные 
- Шэрница
- Разводной ключ
- Открывашка для банок с маслом

### Model Performance
- **Input Size**: 640x640 pixels
- **Confidence Threshold**: 0.25 (configurable)
- **Detection Format**: Bounding boxes with class names and confidence scores

## 🚀 Deployment

### Production Deployment

1. **Update environment variables**
   ```bash
   # In docker-compose.yml
   environment:
     DATABASE_URL: postgresql+psycopg2://user:password@db:5432/production_db
     ML_SERVICE_URL: http://yolo:8001
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Scaling
- **Backend**: Scale horizontally with load balancer
- **ML Service**: Use GPU-enabled instances for better performance
- **Database**: Use managed PostgreSQL service for production

## 🧪 Testing

### ML Service Testing
```bash
# Test with sample image
curl -X POST "http://localhost:8001/analyze" -F "file=@test_image.jpg"
```

## 📝 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Sessions
- `GET /sessions/` - List sessions
- `POST /sessions/` - Create session
- `GET /sessions/{id}` - Get session details
- `POST /sessions/{id}/upload-photo` - Upload photo for analysis

#### Orders
- `GET /orders/?employee_id={id}` - Get orders by employee

#### ML Analysis
- `POST /analyze` - Analyze photo for tool detection

## 🔍 Monitoring and Logging

### Logging
- Application logs: Container stdout
- Database logs: PostgreSQL logs
- ML processing logs: YOLO inference logs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
