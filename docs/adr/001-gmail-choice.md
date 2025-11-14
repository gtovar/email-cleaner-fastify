# ADR 001: Autenticación Gmail con OAuth2

* Status: accepted
* Date: 2025-10-16

## Contexto

Se requiere acceso seguro a Gmail.
IMAP es simple pero menos seguro y tiene menos controles de permisos.

## Decisión

Adoptar OAuth2 con scopes mínimos necesarios y tokens refrescables.

## Consecuencias

* Seguridad alineada al estándar de Google.
* Menor riesgo de exposición.

- Configuración inicial más compleja.

```

