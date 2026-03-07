# ADR-0003 - Soft delete en usuarios y noticias

- Estado: Accepted
- Fecha: 2026-03-06

## Contexto

En entorno ONG se necesita trazabilidad historica y evitar perdida irreversible de informacion por errores operativos.

## Decision

Aplicar borrado logico con `deletedAt` en entidades `User` y `News`.

## Consecuencias

Positivas:

- Recuperabilidad de datos.
- Mejor trazabilidad de operaciones.

Negativas:

- Consultas deben filtrar siempre `deletedAt: null`.
- Mantenimiento de datos historicos puede requerir politicas de archivado.
