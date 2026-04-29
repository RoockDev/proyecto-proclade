# 01 - Vision del Proyecto

## Resumen ejecutivo

Plataforma web para Fundacion Proclade / Equipo PUCH orientada a sensibilizacion y accion contra el hambre (ODS 2), con dos dominios funcionales:

- Zona publica para comunicacion, captacion y consulta de contenido.
- Zona interna de administracion para gestion operativa de datos y contenido.

## Objetivos de negocio

1. Comunicar impacto social de forma clara y actualizada.
2. Facilitar colaboracion (donaciones, participacion y acceso a informacion).
3. Permitir gestion autonoma por parte de personal admin de la ONG.
4. Entregar una base tecnica mantenible por terceros.

## Alcance implementado (estado real)

### Publico

- Home corporativa modular.
- Noticias publicas (`/noticias`, `/noticias/:slug`).
- Superheroes publicos con paginacion y detalle por slug.
- Bibliotecas Humanas publicas con delegaciones dinamicas y descarga de PDFs.
- Chatbot web integrado en layout publico (sesion, sugerencias, feedback).

### Autenticacion y cuenta

- Login con email/password.
- Registro.
- Sign-in con Google.
- Recuperacion y reset de contrasena.
- Cambio de contrasena autenticado.
- Perfil de usuario (`/users/me`) para consulta y actualizacion.

### Panel admin

- Dashboard.
- Gestion de noticias.
- Gestion de retos.
- Gestion de libros humanos (con PDF local).
- Gestion de superheroes (incluye soft delete, restore y borrado permanente).
- Gestion de delegaciones.
- Gestion de usuarios (incluye flag de real hero).
- Gestion del chatbot (knowledge, intents, frases, metricas y unresolved).

## Stack tecnico

- Backend: NestJS 11, TypeScript, Prisma 7, PostgreSQL, JWT, class-validator.
- Frontend: React 19, Vite 7, TypeScript, React Router, Axios, Bootstrap 5.
- Infra: Docker Compose, Nginx reverse proxy, Redis.
- Integraciones externas: Google Identity, SMTP, Google Maps embebido (iframe).

## Convenciones clave

- Rama de integracion: `dev`.
- Contrato API obligatorio:

```ts
{
  success: boolean;
  message: string;
  data: T | null;
}
```

- Autorizacion por roles en backend (`ADMIN`, `USER`).
- Borrado logico en entidades clave (`deletedAt`) salvo casos explicitos de purge.

## Referencias

- Schema de datos: `backend/prisma/schema.prisma`
- Configuracion de red/proxy: `nginx/default.conf`
- Guia visual: `frontend/documentacion/GuiaDeEstilosProclade.pdf`
