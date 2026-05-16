# Proyecto Proclade

Plataforma web desarrollada con **React + NestJS + PostgreSQL** y orquestada con **Docker Compose**.

> Toda la aplicación se ejecuta dentro de contenedores. No se levanta nada con `yarn dev` ni `nest start` en local.

---

## 🧱 Stack

| Capa            | Tecnología                       |
| --------------- | -------------------------------- |
| Frontend        | React 19 + Vite + Bootstrap 5    |
| Backend         | NestJS 11 + Prisma 7             |
| Base de datos   | PostgreSQL 16                    |
| Reverse proxy   | Nginx                            |
| Orquestación    | Docker + Docker Compose          |

---

## 📂 Estructura del proyecto

```txt
/
├── backend/                       # API NestJS (Prisma, JWT, módulos)
│   ├── src/
│   ├── prisma/
│   ├── scripts/
│   │   ├── docker-start-dev.sh    # Arranque dev (nest watch + migrate)
│   │   └── docker-start-prod.sh   # Arranque prod (node dist + migrate deploy)
│   ├── .env.example               # Plantilla variables de entorno (dev)
│   └── .env.prod.example          # Plantilla variables de entorno (prod)
│
├── frontend/                      # React + Vite
│   ├── src/
│   ├── .env.example
│   └── .env.prod.example
│
├── docker/
│   ├── backend/
│   │   ├── Dockerfile.dev
│   │   └── Dockerfile.prod        # Multi-stage: build + node dist
│   └── frontend/
│       ├── Dockerfile.dev
│       └── Dockerfile.prod        # Multi-stage: vite build + nginx
│
├── nginx/
│   ├── default.conf               # Config Nginx dev (proxy a vite y nest)
│   └── default.prod.conf          # Config Nginx prod (SPA + uploads + /api)
│
├── docker-compose.yml             # Orquestación DESARROLLO
├── docker-compose.prod.yml        # Orquestación PRODUCCIÓN
├── .env.example                   # POSTGRES_USER / PASSWORD / DB
└── README.md
```

---

## ✅ Requisitos previos

Solo necesitas tener instalado:

1. **Docker Desktop** (Windows / macOS) o **Docker Engine + Compose v2 plugin** (Linux). Versión mínima recomendada: `Docker 24+`, `Compose v2.20+`.
2. **Git**.

> 💡 **Opcional — solo para el editor:** instalar Node 24+ y Yarn 4 (vía Corepack) si quieres autocompletado y tipos en VS Code. No es necesario para ejecutar la app.

---

## 🚀 Instalación desde cero

Estos pasos deben funcionar en una máquina con una instalación limpia de Docker.

### 1. Clonar el repositorio

```bash
git clone <url-del-repo> proyecto-proclade
cd proyecto-proclade
```

### 2. Crear los ficheros `.env`

El proyecto necesita **tres** ficheros `.env`. Cópialos desde sus plantillas:

```bash
# Linux / macOS
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### 3. Rellenar las variables obligatorias

#### `/.env` (raíz)
Credenciales de Postgres. Inventa cualquier usuario/password (sólo se usan en local):

```env
POSTGRES_USER=dev
POSTGRES_PASSWORD=devpass
POSTGRES_DB=appdb
```

> Asegúrate de que `DATABASE_URL` en `backend/.env` use exactamente los mismos valores.

#### `backend/.env`
Como mínimo necesitas rellenar:

```env
JWT_SECRET=pon-aqui-una-cadena-larga-y-aleatoria-minimo-32-caracteres
SYSTEM_ADMIN_EMAIL=admin@equipo-puch.local
SYSTEM_ADMIN_PASSWORD=CambiaEsta123!
SYSTEM_ADMIN_NAME=Administrador
SYSTEM_ADMIN_SURNAME=Equipo
```

El resto (SMTP, Google) son opcionales para que arranque.

> Para generar un `JWT_SECRET` seguro:
> ```bash
> openssl rand -base64 48
> ```

#### `frontend/.env`
Lo que viene por defecto en `frontend/.env.example` suele bastar para desarrollo:

```env
VITE_API_BASE_URL=/api
VITE_SOCKET_PATH=
```

### 4. Levantar el proyecto en modo desarrollo

Desde la **raíz**:

```bash
docker compose up --build
```

Esto:
- Construye las imágenes (`Dockerfile.dev`).
- Instala dependencias dentro de los contenedores.
- Aplica las migraciones de Prisma.
- Crea/actualiza el admin inicial y la base de conocimiento del chatbot.
- Levanta `db`, `backend`, `frontend` y `nginx`.

Cuando termine, abre 👉 **<http://localhost>**

> Login admin con el email y contraseña configurados en `SYSTEM_ADMIN_*`.

### 5. Solo la primera vez — `yarn install` local (opcional)

Para que VS Code no marque errores de TypeScript:

```bash
cd backend && yarn install
cd ../frontend && yarn install
```

⚠️ Esto **NO** ejecuta la app — sólo añade tipos para el editor.

---

## 🛠️ Modo desarrollo

Compose por defecto = `docker-compose.yml`.

| Acción                              | Comando                                  |
| ----------------------------------- | ---------------------------------------- |
| Arrancar                            | `docker compose up`                      |
| Arrancar reconstruyendo             | `docker compose up --build`              |
| Arrancar en segundo plano           | `docker compose up -d`                   |
| Ver logs                            | `docker compose logs -f`                 |
| Parar                               | `docker compose down`                    |
| Parar y borrar volúmenes (reset)    | `docker compose down -v`                 |
| Entrar al backend                   | `docker compose exec backend sh`         |
| Conectar a Postgres                 | `docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB` |

### Puertos en desarrollo

- **80** → Nginx (único punto de entrada). Es el único puerto que se mapea al host.
- Backend (3000), frontend (5173) y Postgres (5432) viven **solo en la red interna de Docker**. No se exponen al host por seguridad.
- Si necesitas acceder a la base de datos desde un cliente local (DBeaver, TablePlus…), usa `docker compose exec db psql …` o crea un `docker-compose.override.yml` que reabra el puerto sólo en tu máquina.

### Hot reload (HMR)

- **Frontend:** Vite recarga automáticamente al guardar.
- **Backend:** `nest start --watch` recompila al guardar.

---

## 🚢 Modo producción

Compose dedicado = `docker-compose.prod.yml`.

### Diferencias clave respecto a desarrollo

| Aspecto          | Desarrollo                          | Producción                                              |
| ---------------- | ----------------------------------- | ------------------------------------------------------- |
| Frontend         | `vite` (dev server, HMR)            | `vite build` → estáticos servidos por Nginx             |
| Backend          | `nest start --watch`                | `node dist/main` (Nest compilado)                       |
| Migraciones      | `prisma migrate dev`                | `prisma migrate deploy` (no genera nuevas, solo aplica) |
| Volúmenes código | Montado desde host (live edit)      | Imagen inmutable (sin bind mounts de código)            |
| Uploads          | Servidos por Nest desde `/uploads`  | Servidos por Nginx desde volumen compartido             |
| Restart policy   | —                                   | `unless-stopped` en todos los servicios                 |
| Puertos host     | Solo 80 (Nginx)                     | Solo 80 (Nginx)                                         |

### Pasos para arrancar en producción

1. **Preparar los `.env` de producción** (una sola vez):

   ```bash
   cp .env.example .env
   cp backend/.env.prod.example backend/.env
   cp frontend/.env.prod.example frontend/.env
   ```

   Rellena con los **valores reales** de producción:
   - `JWT_SECRET` largo y aleatorio (`openssl rand -base64 48`).
   - `SYSTEM_ADMIN_PASSWORD` robusta.
   - `CORS_ORIGIN` y `FRONTEND_URL` con el dominio público real.
   - Credenciales SMTP reales si vas a enviar emails.
   - `DATABASE_URL` coherente con `POSTGRES_*` del `.env` raíz.

2. **Construir y arrancar**:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Verificar**:

   ```bash
   docker compose -f docker-compose.prod.yml ps
   docker compose -f docker-compose.prod.yml logs -f backend
   ```

   La app queda disponible en 👉 **http://&lt;tu-dominio-o-localhost&gt;**

### Comandos útiles en producción

```bash
# Parar
docker compose -f docker-compose.prod.yml down

# Parar + borrar volúmenes (¡borra la BBDD!)
docker compose -f docker-compose.prod.yml down -v

# Relanzar la inicialización del sistema (idempotente)
docker compose -f docker-compose.prod.yml exec backend yarn prisma:init-system

# Aplicar nuevas migraciones tras un git pull
docker compose -f docker-compose.prod.yml exec backend yarn prisma migrate deploy

# Rebuild tras cambios de código o dependencias
docker compose -f docker-compose.prod.yml up -d --build
```

> ℹ️ Los volúmenes nombrados de prod (`db_data_prod`, `uploads_data`) son distintos a los de dev (`db_data`), así que ambos entornos pueden convivir en la misma máquina sin pisarse.

---

## 🔌 Puertos y red

| Servicio  | Puerto interno | Expuesto al host (dev/prod) |
| --------- | -------------- | --------------------------- |
| nginx     | 80             | **80**                      |
| backend   | 3000           | ❌ no                       |
| frontend  | 5173           | ❌ no (solo dev)            |
| db        | 5432           | ❌ no                       |

Toda la comunicación entre contenedores se hace por la **red interna de Docker** usando los nombres de servicio como hostname (`db`, `backend`, `frontend`).

---

## 🗄️ Base de datos

### Conectarse desde dentro del contenedor

```bash
docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### Aplicar migraciones manualmente

```bash
# Dev
docker compose exec backend yarn prisma migrate dev

# Prod
docker compose -f docker-compose.prod.yml exec backend yarn prisma migrate deploy
```

### Inicialización del sistema

Al arrancar, el backend ejecuta `yarn prisma:init-system` que de forma idempotente:

- crea/verifica los roles `ADMIN` y `USER`,
- crea/actualiza el administrador inicial (desde `SYSTEM_ADMIN_*`),
- carga la base de conocimiento del chatbot.

Relanzar manualmente:

```bash
docker compose exec backend yarn prisma:init-system
```

---

## 🧪 Verificación rápida tras arrancar

1. `docker compose ps` (o `-f docker-compose.prod.yml ps`) → todos `running` / `healthy`.
2. `docker ps --format "table {{.Names}}\t{{.Ports}}"` → solo Nginx muestra `0.0.0.0:80->80/tcp`.
3. <http://localhost> carga el frontend.
4. Login con `SYSTEM_ADMIN_EMAIL` + `SYSTEM_ADMIN_PASSWORD` desde el formulario.
5. En **prod**: en DevTools del navegador, los assets `/assets/*.js` deben tener hash y devolver `200` desde Nginx (no `:5173`).

---

## 🆘 Troubleshooting

### El puerto 80 está ocupado
Para temporalmente el servicio que lo usa (otro Nginx, IIS, Apache…) o edita el mapeo en el compose (`"8080:80"`).

### Cambié dependencias y no se reflejan
```bash
docker compose down
docker compose up -d --build
```

Si persiste, borra los volúmenes de `node_modules`:
```bash
docker compose down
docker volume rm proyectoproclade_backend_node_modules proyectoproclade_frontend_node_modules
docker compose up -d --build
```

### Reset completo (¡borra la BBDD!)
```bash
docker compose down -v
docker compose up --build
```

### `package-lock.json` colado sin querer
```bash
rm -f backend/package-lock.json frontend/package-lock.json
```

### Verificar comunicación interna db ↔ backend
```bash
docker compose exec backend sh -c "nc -zv db 5432"
```

---

## 📌 Protocolo de dependencias (Yarn 4)

### Reglas base
- Usar **Yarn 4 (Corepack)**.
- No usar `npm install`.
- No subir `package-lock.json` ni `.yarn/install-state.gz`.

### Instalar una dependencia nueva

Ejecutarlo **dentro del contenedor** para que se quede en su `node_modules` y se actualice `yarn.lock`:

```bash
# Backend
docker compose exec backend yarn add <paquete>
docker compose exec backend yarn add -D <paquete>   # dev dep

# Frontend
docker compose exec frontend yarn add <paquete>
```

### Qué subir a Git tras cambiar dependencias
Siempre juntos:
- `package.json`
- `yarn.lock`

### Tras un `git pull`

```bash
# Si NO cambiaron dependencias
docker compose up -d

# Si SÍ cambiaron (package.json / yarn.lock)
docker compose down
docker compose up -d --build
```

### Verificación rápida del lockfile (Yarn 4)
```bash
head -n 8 backend/yarn.lock
head -n 8 frontend/yarn.lock
```
Debe verse `__metadata` y `version: 8`.

---

## 🧠 Reglas importantes del proyecto

- ❌ **No** ejecutar `yarn dev`, `npm start`, `nest start` en local.
- ✅ Todo se ejecuta con **Docker**.
- ✅ `yarn install` local solo es para el editor.
- ❌ **No** tocar `node_modules` de Docker.
- ❌ **No** subir archivos `.env` al repositorio.
- ❌ En producción **no** se generan migraciones nuevas (`migrate dev`). Solo se aplican (`migrate deploy`).
