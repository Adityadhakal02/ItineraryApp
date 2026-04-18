FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=180

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY create_tables.py .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "python create_tables.py && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
