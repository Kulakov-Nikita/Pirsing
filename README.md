# Pirsing - Система распознавания инструментов на основе ИИ

Комплексная система для распознавания и управления инструментами с использованием компьютерного зрения и машинного обучения. Проект состоит из React фронтенда, FastAPI бэкенда и ML-сервиса на основе YOLOv8 для детекции инструментов.

Размещено: http://pirsiing.duckdns.org/

## 🏗️ Архитектура

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
*Структура базы данных и связи*

### Классовая диаграмма
![ML Pipeline](docs/image%20(15).png)
*Пайплайн обработки машинного обучения*

### Диаграмма развертывания
![API Integration](docs/image%20(16).png)
*Паттерны API-коммуникации между сервисами*

### Диаграмма активности
![Activity Diagram](docs/image%20(17).png)

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Node.js 18+ (для локальной разработки фронтенда)
- Python 3.10+ (для локальной разработки бэкенда)

### Запуск с Docker Compose

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd Pirsing
   ```

2. **Запустите все сервисы**
   ```bash
   docker-compose up --build
   ```

3. **Доступ к приложению**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8000
   - ML Service: http://localhost:8001
   - API Documentation: http://localhost:8000/docs

### Как тестировать
1. Перейдите на http://pirsiing.duckdns.org/ или в случае локальной настройки на http://localhost/.

2. Следуйте инструкциям в интерфейсе. **Для тестирования можно использовать E00001 как номер ТОИР сотрудника**.

#### Пошаговое визуальное руководство

**Шаг 1: Главная страница приложения**
![Application Homepage](docs/photo_2025-10-02%2021.06.12.jpeg)
*Начальный интерфейс приложения, показывающий главную точку входа*

**Шаг 2: Ввод ID сотрудника**
![Employee ID Input](docs/photo_2025-10-02%2021.06.15.jpeg)
*Введите ID сотрудника (используйте E00001 для тестирования)*

**Шаг 3: Выбор типа заказа**
![Order Selection](docs/photo_2025-10-02%2021.06.19.jpeg)
*Выберите тип заказа из доступного списка: получение или возврат инструментов*

**Шаг 4: Выбор заказа**
![Order Selection](docs/photo_2025-10-02%2021.06.22.jpeg)
*Выберите заказ из доступного списка*

**Шаг 5: Интерфейс захвата фото**
![Photo Capture](docs/photo_2025-10-02%2021.06.26.jpeg)
*Интерфейс камеры для захвата фотографий инструментов*

**Шаг 6: Результаты распознавания инструментов**
![Recognition Results](docs/photo_2025-10-02%2021.06.29.jpeg)
*Результаты детекции и распознавания инструментов на основе ИИ*


## 📁 Структура проекта

```
Pirsing/
├── Backend/                 # FastAPI backend service
│   ├── app/
│   │   ├── models.py        # Модели базы данных
│   │   ├── routers.py       # API endpoints
│   │   ├── schemas.py       # Pydantic схемы
│   │   ├── clients.py       # Клиенты внешних сервисов
│   │   └── database.py      # Конфигурация базы данных
│   ├── alembic/             # Миграции базы данных
│   ├── main.py             # FastAPI приложение
│   └── requirements.txt    # Python зависимости
├── Frontend/                # React frontend
│   ├── src/
│   │   ├── view/           # React компоненты
│   │   ├── utils.ts        # API утилиты
│   │   └── App.tsx         # Главное приложение
│   ├── package.json        # Node.js зависимости
│   └── Dockerfile          # Frontend контейнер
├── ML/                      # YOLOv8 ML service
│   ├── app.py              # FastAPI ML service
│   ├── best.pt             # Обученная YOLO модель
│   └── requirements.txt    # ML зависимости
└── docker-compose.yml      # Оркестрация мульти-сервисов
```

## 🔧 Обзор сервисов



### Backend Service (FastAPI)
- **Порт**: 8000
- **База данных**: PostgreSQL с SQLAlchemy ORM
- **Функции**:
  - Управление сессиями
  - Загрузка и обработка фотографий
  - Управление заказами
  - Интеграция с ML сервисом
  - Миграции базы данных с Alembic

**Ключевые Endpoints**:
- `GET /sessions/` - Список всех сессий
- `POST /sessions/` - Создание новой сессии
- `POST /sessions/{id}/upload-photo` - Загрузка фото для анализа
- `GET /orders/` - Получение заказов по ID сотрудника

### ML Service (YOLOv8)
- **Порт**: 8001
- **Модель**: Кастомная YOLOv8, обученная на датасете инструментов
- **Функции**:
  - Детекция инструментов в реальном времени
  - Оценка уверенности
  - Координаты ограничивающих рамок
  - Классификация инструментов

**Ключевые Endpoints**:
- `POST /analyze` - Анализ загруженного фото на предмет инструментов

### Frontend Service (React)
- **Порт**: 80
- **Функции**:
  - Захват фото (камера/галерея)
  - Распознавание инструментов в реальном времени
  - Управление сессиями
  - Отслеживание заказов

## 🛠️ Настройка разработки

### Разработка Backend

1. **Перейдите в директорию backend**
   ```bash
   cd Backend
   ```

2. **Создайте виртуальное окружение**
   ```bash
   python -m venv venv
   source venv/bin/activate  # На Windows: venv\Scripts\activate
   ```

3. **Установите зависимости**
   ```bash
   pip install -r requirements.txt
   ```

4. **Настройте базу данных**
   ```bash
   # Для PostgreSQL (рекомендуется)
   export DATABASE_URL="postgresql+psycopg2://app:app@localhost:5432/app"
   
   # Для SQLite (разработка)
   export DATABASE_URL="sqlite:///./app.db"
   ```

5. **Запустите миграции**
   ```bash
   alembic upgrade head
   ```

6. **Запустите сервер**
   ```bash
   uvicorn main:app --reload
   ```

### Разработка Frontend

1. **Перейдите в директорию frontend**
   ```bash
   cd Frontend
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Запустите сервер разработки**
   ```bash
   npm start
   ```

### Разработка ML Service

1. **Перейдите в директорию ML**
   ```bash
   cd ML
   ```

2. **Создайте виртуальное окружение**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Установите зависимости**
   ```bash
   pip install -r requirements.txt
   ```

4. **Запустите сервис**
   ```bash
   uvicorn app:app --reload --port 8001
   ```

## 🔄 API Интеграция

### Backend ↔ ML Service
Бэкенд взаимодействует с ML сервисом для анализа фотографий:

```python
# Backend отправляет фото в ML сервис
ml_response = await process_photo_with_ml(photo_content, filename)
detected_tools = ml_response.get("bboxes", [])
```

### Frontend ↔ Backend
Фронтенд взаимодействует с бэкендом для управления сессиями:

```typescript
// Frontend создает сессию
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

## 🗄️ Схема базы данных

### Таблица Sessions
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

## 🔧 Конфигурация

### Переменные окружения

**Backend**:
- `DATABASE_URL`: Строка подключения к базе данных
- `ORDERS_SERVICE_URL`: URL внешнего сервиса заказов (или "mock")
- `ML_SERVICE_URL`: URL ML сервиса (по умолчанию: http://yolo:8001)

**Frontend**:
- `BACKEND_SERVICE_URL`: URL Backend API

**ML Service**:
- `MODEL_PATH`: Путь к файлу YOLO модели (по умолчанию: "best.pt")
- `DEFAULT_CONF`: Порог уверенности (по умолчанию: 0.25)
- `DEFAULT_IMGSZ`: Размер изображения для обработки (по умолчанию: 640)

## 📊 Детали ML модели

### Поддерживаемые инструменты
Модель YOLOv8 обучена для детекции следующих инструментов:
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

### Производительность модели
- **Размер входа**: 640x640 пикселей
- **Порог уверенности**: 0.25 (настраивается)
- **Формат детекции**: Ограничивающие рамки с именами классов и оценками уверенности

## 🚀 Развертывание

### Продакшн развертывание

1. **Обновите переменные окружения**
   ```bash
   # В docker-compose.yml
   environment:
     DATABASE_URL: postgresql+psycopg2://user:password@db:5432/production_db
     ML_SERVICE_URL: http://yolo:8001
   ```

2. **Соберите и разверните**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Масштабирование
- **Backend**: Масштабирование горизонтально с балансировщиком нагрузки
- **ML Service**: Используйте GPU-инстансы для лучшей производительности
- **База данных**: Используйте управляемый PostgreSQL сервис для продакшна

## 🧪 Тестирование

### Тестирование ML Service
```bash
# Тест с примером изображения
curl -X POST "http://localhost:8001/analyze" -F "file=@test_image.jpg"
```

## 📝 API Документация

### Интерактивная документация
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Ключевые API Endpoints

#### Sessions
- `GET /sessions/` - Список сессий
- `POST /sessions/` - Создание сессии
- `GET /sessions/{id}` - Получение деталей сессии
- `POST /sessions/{id}/upload-photo` - Загрузка фото для анализа

#### Orders
- `GET /orders/?employee_id={id}` - Получение заказов по сотруднику

#### ML Analysis
- `POST /analyze` - Анализ фото для детекции инструментов

## 🔍 Мониторинг и логирование

### Логирование
- Логи приложения: stdout контейнера
- Логи базы данных: PostgreSQL логи
- Логи ML обработки: YOLO inference логи

## 📄 Лицензия

Этот проект лицензирован под лицензией MIT - см. файл LICENSE для деталей.