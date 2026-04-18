# Monorepo root — used when Railway builds from repo root (Root Directory empty).
# For local Docker from backend/ only, use backend/Dockerfile instead.
FROM python:3.12-slim-bookworm

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/create_tables.py .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "python create_tables.py && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
