# ADR-0007 - Bootstrap del sistema en arranque Docker

- Estado: Accepted
- Fecha: 2026-05-13

## Contexto

La aplicación dejó de ser fiable cuando dependía de ejecutar seeds manuales para tener roles, admin inicial y base del chatbot. El montaje limpio debía quedar operativo con un solo `docker compose up --build`.

## Decisión

Mover la inicialización base del sistema a `backend/prisma/bootstrap-system.ts` y ejecutarla automáticamente desde `backend/scripts/docker-start-dev.sh` tras `prisma migrate deploy`.

El bootstrap actual:

1. asegura roles `ADMIN` y `USER`
2. crea o verifica el admin inicial
3. carga la base inicial del chatbot

## Consecuencias

### Positivas

- Instalación limpia más fiable
- Menos pasos manuales de handover
- Menor dependencia de seeds demo

### Negativas

- El equipo debe entender bien el comportamiento de `SYSTEM_ADMIN_*`
- Cambiar `SYSTEM_ADMIN_PASSWORD` después de que el usuario exista no le cambia la contraseña automáticamente
