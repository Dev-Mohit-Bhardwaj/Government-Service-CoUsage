# ==============================================================================
# PROJECT KRATOS — Multi-Stage Production Dockerfile
# Stage 1: Builds the React + Vite + Three.js Frontend
# Stage 2: Packages the Python + FastAPI + ML Backend & Serves Both
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Frontend Builder
# ------------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Build static assets
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Python Backend Runtime
# ------------------------------------------------------------------------------
FROM python:3.12-slim

WORKDIR /app

# Prevent Python from writing .pyc files & enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source and datasets
COPY config.py .
COPY DataSet/ ./DataSet/
COPY modules/ ./modules/
COPY api/ ./api/

# Copy compiled React static bundle from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (Render dynamically provides $PORT)
EXPOSE 8000

# Start Uvicorn bound to 0.0.0.0 and dynamic $PORT
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
