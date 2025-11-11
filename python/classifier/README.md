# Clasificador de correos (Microservicio Python)

Este microservicio expone un endpoint POST `/suggest` que recibe metadatos de correos y devuelve sugerencias de limpieza.

## Ejecutar local

```bash
uvicorn app:app --reload --port 5000
```

## Estructura

- `logic/classifier.py`: Lógica principal de clasificación
- `app.py`: Punto de entrada FastAPI
- `models/`: Esquemas Pydantic (si se usan)
- `tests/`: Pruebas automáticas

## Autores
Este servicio fue diseñado como parte de Email Cleaner & Smart Notifications
