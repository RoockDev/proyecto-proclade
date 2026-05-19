# Documentación técnica del Proyecto Proclade

## Objetivo

Esta documentación está pensada para un equipo técnico que hereda el proyecto y necesita:

1. Levantarlo en local sin depender del equipo original.
2. Entender la arquitectura real que existe hoy en `origin/dev`.
3. Mantener contenido, flujos de autenticación, chatbot, privacidad y operación Docker.
4. Identificar riesgos, deuda y decisiones ya tomadas para no romper el sistema al evolucionarlo.

## Estado de esta rama

- Rama de documentación: `docs`
- Rama funcional de referencia integrada aquí: `origin/dev`
- Fecha de corte técnico: `2026-05-19`
- Contexto funcional cubierto:
  - Web pública
  - Autenticación y perfil
  - Panel admin
  - Chatbot público y admin
  - Privacidad, cookies y servicios externos
  - Operación Docker y handover

## Qué cambió respecto a la documentación antigua

Esta revisión corrige varios desfases importantes:

- Ya no existe autenticación con Google.
- Redis ya no forma parte del stack Docker actual.
- El arranque del sistema ya no depende de un `seed.ts` manual, sino de `prisma:init-system`.
- El admin inicial se crea/verifica desde `backend/prisma/bootstrap-system.ts`.
- El proyecto ya incorpora aceptación de privacidad en registro y Colabora.
- Ya existe gestión de cookies/preferencias de servicios externos en frontend.
- El chatbot admin ya tiene actualización en tiempo real por WebSocket.

## Estructura

- [01 - Visión del proyecto](./01-project-overview.md)
- [02 - Arquitectura](./02-architecture/)
- [03 - Backend](./03-backend/)
- [04 - Frontend](./04-frontend/)
- [05 - DevOps e infraestructura](./05-devops/)
- [06 - Handover operativo](./06-handover/)
- [07 - Calidad, riesgos y deuda](./07-quality/)
- [08 - Chatbot](./08-chatbot/)
- [ADR - Decisiones arquitectónicas](./adr/)
- Anexos operativos:
  - [Configuración de correo](./configuracion-correo-proclade.md)
  - [Configuración de recuperación de contraseña](./configuracion-recuperacion-contrasena-proclade.md)

## Reglas de mantenimiento

1. Cada cambio mergeado a `dev` que altere comportamiento debe reflejarse en `docs/`.
2. Si cambia un endpoint, revisar `docs/03-backend/03.2-api-reference.md`.
3. Si cambia un flujo transversal, revisar `docs/02-architecture/02.4-runtime-flows.md`.
4. Si cambia un comportamiento técnico estructural, añadir o actualizar un ADR.
5. Si se cambia el bootstrap, la política de contraseñas, privacidad/cookies o el modelo del chatbot, revisar también `docs/05-devops/`, `docs/06-handover/` y `docs/08-chatbot/`.

## Orden recomendado de lectura

1. `docs/01-project-overview.md`
2. `docs/02-architecture/*`
3. `docs/05-devops/05.1-local-environment.md`
4. `docs/06-handover/06.1-onboarding-guide.md`
5. `docs/03-backend/*` y `docs/04-frontend/*`
6. `docs/08-chatbot/*`
