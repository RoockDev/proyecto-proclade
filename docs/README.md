# Documentacion Tecnica del Proyecto Proclade

## Objetivo

Esta documentacion esta pensada para un equipo tecnico externo que deba mantener, evolucionar y operar la plataforma sin depender del equipo original.

## Alcance

Incluye arquitectura, backend, frontend, infraestructura, despliegue, calidad y runbook operativo.

## Estructura

- [01 - Vision del Proyecto](./01-project-overview.md)
- [02 - Arquitectura](./02-architecture/)
- [03 - Backend](./03-backend/)
- [04 - Frontend](./04-frontend/)
- [05 - DevOps e Infraestructura](./05-devops/)
- [06 - Handover Operativo](./06-handover/)
- [07 - Calidad y Riesgos](./07-quality/)
- [ADR - Decision Records](./adr/)

## Reglas de mantenimiento

1. Toda HU mergeada a `dev` debe reflejarse en estos documentos.
2. Si cambia un contrato API, actualizar primero `03-backend/api-reference.md`.
3. Si cambia arquitectura, registrar decision en `adr/`.
4. No mezclar documentacion funcional con tareas personales del equipo.

## Estado actual

Version de la documentacion: `v1-inicial-handover`.

Fecha de corte tecnico: `2026-03-06`.
