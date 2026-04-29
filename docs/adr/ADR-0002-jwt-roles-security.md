# ADR-0002 - Seguridad basada en JWT y Roles

- Estado: Accepted
- Fecha: 2026-03-06

## Contexto

Se requiere separar acceso publico de operaciones administrativas sin introducir complejidad excesiva.

## Decision

- Autenticacion con JWT Bearer.
- Autorizacion por rol mediante `@Roles`, `RolesGuard` y `JwtAuthGuard`.
- Endpoints de administracion protegidos por rol `ADMIN`.

## Consecuencias

Positivas:

- Implementacion clara y mantenible.
- Escalable a nuevos roles.

Negativas:

- Necesita controles complementarios (rate limit, auditoria y observabilidad).
