# API image when Railway **Root Directory** is the repo root (`.`) or empty.
# If you set Root Directory to `backend` instead, Railway uses `backend/Dockerfile`
# (same layout, paths relative to that folder).
FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=180

COPY backend/requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/create_tables.py .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "python create_tables.py && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
