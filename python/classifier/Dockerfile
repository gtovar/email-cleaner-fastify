FROM python:3.11-slim

WORKDIR /app

# Con context: .., estas rutas existen respecto a la raíz del repo
COPY python/classifier/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY python/classifier/ ./

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
