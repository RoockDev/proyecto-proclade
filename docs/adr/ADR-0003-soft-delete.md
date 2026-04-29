# ADR-0003 - Soft delete por defecto

- Estado: Accepted
- Fecha: 2026-03-06

## Contexto

En entorno ONG se necesita trazabilidad y recuperacion ante errores operativos.

## Decision

Aplicar borrado logico con `deletedAt` como politica por defecto en entidades gestionables.

Excepciones controladas:

- En superheroes se permite endpoint de borrado permanente tras desactivacion previa.

## Consecuencias

Positivas:

- Recuperabilidad y trazabilidad.

Negativas:

- Todas las consultas deben filtrar `deletedAt: null` cuando proceda.
- A medio plazo requiere politica de archivado/purga operativa.
