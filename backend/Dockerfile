# 1. Use a minimal official Python image to keep the image size small
FROM python:3.11-slim

# 2. Set environment variables
# Prevents Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
# Ensures logs are shown in real-time (helpful in Docker)
ENV PYTHONUNBUFFERED=1

# 3. Set working directory in the container
WORKDIR /app

# 4. Install OS-level dependencies
RUN apt-get update && apt-get install -y netcat-openbsd gcc libpq-dev

# 5. Copy only requirements first (to utilize Docker caching)
COPY requirements.txt .

# 6. Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 7. Copy app code and environment file
COPY ./app ./app
COPY .env .

# 8. Expose FastAPI's default port
EXPOSE 8000

# 9. Start the app using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
