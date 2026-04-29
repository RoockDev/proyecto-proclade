# Documentacion Tecnica del Proyecto Proclade

## Objetivo

Esta documentacion esta orientada a un equipo tecnico externo que deba mantener, evolucionar y operar la plataforma sin depender del equipo original.

## Alcance

Incluye arquitectura, backend, frontend, DevOps, handover operativo, calidad y chatbot.

## Estructura

- [01 - Vision del Proyecto](./01-project-overview.md)
- [02 - Arquitectura](./02-architecture/)
- [03 - Backend](./03-backend/)
- [04 - Frontend](./04-frontend/)
- [05 - DevOps e Infraestructura](./05-devops/)
- [06 - Handover Operativo](./06-handover/)
- [07 - Calidad y Riesgos](./07-quality/)
- [08 - Chatbot](./08-chatbot/)
- [ADR - Architecture Decision Records](./adr/)

## Reglas de mantenimiento

1. Toda HU mergeada a `dev` debe reflejarse en `docs/`.
2. Si cambia un endpoint o su contrato, actualizar primero `docs/03-backend/03.2-api-reference.md`.
3. Si cambia un flujo principal (auth, admin, chatbot, bibliotecas humanas), actualizar `docs/02-architecture/02.4-runtime-flows.md`.
4. Cada decision tecnica transversal debe quedar registrada en `docs/adr/`.

## Estado actual

Version de documentacion: `v2-handover-operativo`.

Fecha de corte tecnico: `2026-04-29`.
