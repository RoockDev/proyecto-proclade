# ADR-0006 - Bibliotecas Humanas publicas con datos reales

- Estado: Accepted
- Fecha: 2026-04-29

## Contexto

La seccion publica de Bibliotecas Humanas debia dejar de depender de mocks para mantener coherencia con el panel admin y con datos reales de la ONG.

## Decision

Consumir en frontend publico:

- `GET /regions` para delegaciones activas.
- `GET /human-books` para libros publicados.

Soporte adicional:

- URL semantica por delegacion (`/bibliotecas-humanas/:delegationSlug`).
- Mapa embebido por iframe con CSP ajustada en Nginx.

## Consecuencias

Positivas:

- Coherencia entre backoffice y sitio publico.
- Menor deuda tecnica de datos duplicados.

Negativas:

- Dependencia directa de calidad de datos admin (nombres/direcciones).
- Requiere monitorizar CSP y disponibilidad de proveedor de mapa.
