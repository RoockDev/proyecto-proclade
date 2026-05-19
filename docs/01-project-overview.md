# 01 - Visión del proyecto

## Resumen ejecutivo

Proyecto Proclade es una plataforma web fullstack para Fundación PROCLADE / Equipo PUCH con dos dominios principales:

1. Una web pública de comunicación, sensibilización y captación.
2. Un panel de administración para gestionar contenido, usuarios y base de conocimiento del chatbot.

El sistema está orientado a operar completamente en Docker, con Nginx como punto de entrada único en `http://localhost`.

## Objetivos de negocio

1. Mostrar noticias, retos y testimonios de forma editable por personal no técnico.
2. Facilitar la colaboración mediante formularios, contenido público y rutas de conversión.
3. Permitir que la ONG mantenga sus delegaciones y bibliotecas humanas desde un panel admin.
4. Incorporar un chatbot con base de conocimiento administrable y soporte en tiempo real para el backoffice.
5. Entregar una base técnica mantenible por terceros.

## Alcance implementado a día de hoy

### Web pública

- Home corporativa con secciones dinámicas.
- Noticias públicas:
  - `/noticias`
  - `/noticias/:slug`
- Superhéroes públicos:
  - `/superheroes`
- Bibliotecas humanas:
  - `/bibliotecas-humanas`
  - `/bibliotecas-humanas/:delegationSlug`
- Colabora:
  - `/colabora`
- Contacto:
  - `/contacto`
- Footer con aviso legal, privacidad y configuración de cookies.

### Identidad y cuenta

- Login con email y contraseña.
- Registro con aceptación obligatoria de política de privacidad.
- Recuperación de contraseña por email.
- Restablecimiento de contraseña mediante token.
- Cambio de contraseña autenticado.
- Perfil de usuario con actualización básica.

### Panel admin

- Dashboard
- Noticias
- Retos
- Libros humanos
- Superhéroes
- Delegaciones
- Usuarios
- Chatbot

### Chatbot

- Widget público siempre disponible en `PublicLayout`.
- Sesión persistida en cliente.
- Respuestas híbridas:
  - knowledge base
  - contexto dinámico de noticias, retos, superhéroes y delegaciones
- Sugerencias y feedback.
- Backoffice admin de métricas, unresolved, intents, phrases, knowledge y configuración.
- Actualización en tiempo real hacia el panel admin mediante WebSocket.

### Privacidad y servicios externos

- Aceptación obligatoria de privacidad en registro y Colabora.
- Campo `privacyAcceptedAt` en usuario.
- Preferencias de cookies/servicios externos en frontend.
- Google Maps bloqueado hasta aceptar servicios externos.
- Aviso de no introducir datos sensibles en el chatbot.

## Stack técnico actual

- Backend:
  - NestJS 11
  - Prisma 7
  - PostgreSQL
  - JWT
  - class-validator / class-transformer
  - Socket.IO
  - Nodemailer
- Frontend:
  - React 19
  - Vite 7
  - React Router 7
  - Axios
  - Bootstrap 5
  - Socket.IO Client
- Infraestructura:
  - Docker Compose
  - Nginx
  - volúmenes locales Docker
  - filesystem local para uploads

## Lo que ya no forma parte del proyecto

- Autenticación con Google
- Redis en la stack Docker
- Un seed general de usuarios demo como requisito para poder operar el sistema

## Referencias de código

- Backend raíz: `backend/src/`
- Frontend raíz: `frontend/src/`
- Modelo de datos: `backend/prisma/schema.prisma`
- Arranque del sistema: `backend/scripts/docker-start-dev.sh`
- Bootstrap inicial: `backend/prisma/bootstrap-system.ts`
- Reverse proxy: `nginx/default.conf`
