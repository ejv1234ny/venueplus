# Repo-root Dockerfile: builds the FastAPI backend from the monorepo root, so
# Railway deploys correctly even when the service Root Directory is NOT set to
# "backend". (backend/Dockerfile is used when Root Directory IS set to backend.)
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps (path is relative to the repo-root build context)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code into /app
COPY backend/ .

EXPOSE 8000

# Bind to Railway's $PORT (fallback 8000 for local)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
