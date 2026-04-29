# ADR-0005 - Storage local de uploads en fase actual

- Estado: Accepted
- Fecha: 2026-04-29

## Contexto

El proyecto requiere gestionar imagenes y PDFs desde panel admin sin introducir infraestructura cloud adicional en fase academica.

## Decision

Persistir assets en filesystem local del backend (`backend/uploads`) y exponerlos via `/uploads`.

Dominios afectados:

- News images
- Superheroes images
- Human books PDFs

## Consecuencias

Positivas:

- Implementacion simple y rapida.
- Facil de operar en local/staging inicial.

Negativas:

- Sin backup gestionado por defecto.
- Escalabilidad limitada para produccion multi instancia.
