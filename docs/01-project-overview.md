# 01 - Vision del Proyecto

## Resumen ejecutivo

Proyecto web para Fundacion Proclade / Equipo PUCH orientado a sensibilizacion y accion contra el hambre (ODS 2), con:

- Zona publica: home, noticias, contenido de impacto y colaboracion.
- Zona de autenticacion: login, registro, Google Sign-In y recuperacion de contrasena.
- Zona de administracion: panel interno y gestion de noticias/campanas.

## Objetivos de negocio

1. Comunicar impacto de la ONG en terreno.
2. Facilitar captacion de apoyo y colaboracion.
3. Permitir gestion interna de contenido (especialmente noticias).
4. Preparar el producto para despliegue real en entorno staging/produccion.

## Alcance implementado a fecha de corte

- Backend NestJS con modulos de Auth, Users y News.
- Frontend React con arquitectura por features.
- Contrato de respuesta API unificado (`success`, `message`, `data`).
- Docker Compose para entorno de desarrollo completo.
- CI de build en GitHub Actions.
- Pipeline base de despliegue a staging (parcial, con placeholders en fases de lint/test segun HU).

## Stack tecnico

- Backend: NestJS 11, TypeScript, Prisma 7, PostgreSQL, Redis, JWT, Nodemailer.
- Frontend: React 19, Vite 7, TypeScript, React Router, Axios, Bootstrap 5.
- Infra: Docker, Docker Compose, Nginx.
- CI/CD: GitHub Actions.

## Convenciones clave del proyecto

- Rama de integracion: `dev`.
- Contrato API obligatorio:

```ts
{
  success: boolean;
  message: string;
  data: T | null;
}
```

- Soft delete en entidades principales (`deletedAt`).
- Roles de acceso en backend: `ADMIN`, `USER`.

## Referencias

- Guia de estilos visual (PDF): `frontend/documentación/GuíaDeEstilosProclade.pdf`
- Esquema de datos: `backend/prisma/schema.prisma`
