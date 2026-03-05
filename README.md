# Proyecto Proclade

Proyecto base para el desarrollo de una plataforma web usando **Docker** como entorno principal de ejecución.


## 🧱 Tecnologías

- **Frontend:** React + Vite
- **Backend:** NestJS + Prisma
- **Base de datos:** PostgreSQL
- **Cache / colas:** Redis
- **Proxy inverso:** Nginx
- **Contenedores:** Docker + Docker Compose

## 📂 Estructura del proyecto

```txt
/
├── backend/                # API NestJS
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── yarn.lock
│
├── frontend/               # React + Vite
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── yarn.lock
│
├── docker/
│   ├── backend/
│   │   └── Dockerfile.dev
│   └── frontend/
│       └── Dockerfile.dev
│
├── nginx/
│   └── default.conf
│
├── docker-compose.yml
├── .yarnrc.yml
├── .gitignore
└── README.md

## ⚙️ Requisitos

Solo necesitas tener instalado:
1. Docker
2. Docker Compose
3. Node.js + Yarn (solo para el editor, **NO** para ejecutar la app)

> ⚠️ **Nota:** La aplicación **NO** se ejecuta en local, siempre se ejecuta en Docker.

---

## 🚀 Arranque del proyecto (lo normal)

Desde la **raíz del proyecto** ejecuta:

```bash
docker compose up --build
```

Esto realiza los siguientes pasos:
- Construye las imágenes.
- Instala dependencias dentro de Docker.
- Levanta frontend, backend, base de datos, redis y nginx.

La aplicación quedará disponible en: [http://localhost](http://localhost)

### 🧠 Importante: yarn install (solo para VS Code)

Para que Visual Studio Code no marque errores de TypeScript, cada desarrollador debe ejecutar una vez:

```bash
cd backend
yarn install

cd ../frontend
yarn install
```

> ⚠️ Esto **NO** ejecuta la app.
> ⚠️ Es solo para autocompletado, tipos y evitar errores en el editor.
> ⚠️ La ejecución real siempre es con Docker.

---

## 🐳 Comandos Docker más usados

### ▶️ Arrancar el proyecto

```bash
docker compose up
```

### ▶️ Arrancar reconstruyendo todo

Usar cuando:
- Cambian dependencias.
- Cambian Dockerfiles.
- Algo no arranca bien.

```bash
docker compose up --build
```

### ⏹️ Parar los contenedores

```bash
docker compose down
```
👉 *Mantiene la base de datos y el estado.*

### 🔥 Parar y borrar TODO (reset completo)

```bash
docker compose down -v
```

👉 **Borra:**
- Base de datos
- Dependencias de Docker
- Estado del proyecto

*Usar solo si algo se ha roto o quieres empezar de cero.*

---

## 📦 Ejecutar comandos dentro del contenedor (\`docker exec\`)

Se usa para ejecutar comandos dentro de un contenedor que ya está corriendo.

**1. Primero, ver los contenedores activos:**

```bash
docker ps
```

Verás algo como:
- `proyectoproclade-backend-1`
- `proyectoproclade-frontend-1`
- `proyectoproclade-db-1`
- `proyectoproclade-redis-1`

**2. Entrar al backend:**

```bash
docker exec -it proyectoproclade-backend-1 sh
```
- Salir escribiendo: `exit`

**3. Ejecutar comandos directamente (sin entrar):**

- **Instalar una dependencia en el backend:**
  ```bash
  docker exec -it proyectoproclade-backend-1 yarn add bcrypt
  ```

- **Instalar una dependencia de desarrollo:**
  ```bash
  docker exec -it proyectoproclade-backend-1 yarn add -D @types/bcrypt
  ```

- **Ejecutar Prisma:**
  ```bash
  docker exec -it proyectoproclade-backend-1 yarn prisma migrate dev
  ```

### ❓ ¿Puedo ejecutar estos comandos desde VS Code?

**Sí.**
- Abre la terminal integrada de VS Code.
- Ejecuta los comandos `docker exec` desde ahí.
- No hace falta usar Docker Desktop directamente.

---

## 🧠 Reglas importantes del proyecto

- ❌ **No** ejecutar `yarn dev`, `npm start`, `nest start` en local.
- ✅ Todo se ejecuta con **Docker**.
- ✅ `yarn install` local solo es para el editor.
- ❌ **No** tocar `node_modules` de Docker.
- ❌ **No** subir archivos `.env` al repositorio.

---

## 📌 Protocolo de dependencias (Yarn 4) + comandos

### 1) Regla base
- Usar **Yarn 4 (Corepack)**.
- No usar `npm install`.
- No subir `package-lock.json` ni `.yarn/install-state.gz`.

### 2) Instalar una dependencia nueva (frontend/backend)

#### Frontend
```bash
cd frontend
corepack enable
corepack prepare yarn@4.12.0 --activate
yarn add <paquete>
```

#### Backend
```bash
cd backend
corepack enable
corepack prepare yarn@4.12.0 --activate
yarn add <paquete>
```

#### Dependencia de desarrollo
```bash
yarn add -D <paquete>
```

#### Quitar dependencia
```bash
yarn remove <paquete>
```

### 3) Qué subir a Git cuando cambian dependencias
Siempre juntos:
- `package.json`
- `yarn.lock`

Comprobar:
```bash
git status --short
```

### 4) Después de `git pull`

#### Si NO cambiaron dependencias
```bash
docker compose up -d
```

#### Si SÍ cambiaron dependencias (`package.json`/`yarn.lock`)
```bash
docker compose down
docker compose up -d --build
```

### 5) Si Docker sigue fallando por módulos/cache
```bash
docker compose down
docker volume rm proyectoproclade_backend_node_modules proyectoproclade_frontend_node_modules
docker compose up -d --build
```

Comprobar estado:
```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

### 6) Si se cuela npm sin querer
Eliminar lock npm:
```bash
rm -f backend/package-lock.json frontend/package-lock.json
```

Reinstalar con Yarn 4:
```bash
cd backend && corepack enable && corepack prepare yarn@4.12.0 --activate && yarn install
cd ../frontend && corepack enable && corepack prepare yarn@4.12.0 --activate && yarn install
```

### 7) Si `install-state.gz` aparece en Git
Quitar del tracking (una vez):
```bash
git rm --cached backend/.yarn/install-state.gz frontend/.yarn/install-state.gz
```

Descartar cambios locales de ese archivo:
```bash
git restore backend/.yarn/install-state.gz frontend/.yarn/install-state.gz
```

### 8) Verificación rápida de lockfile correcto (Yarn 4)
```bash
head -n 8 backend/yarn.lock
head -n 8 frontend/yarn.lock
```

Debe verse `__metadata` y `version: 8`.

---

## Seeds (Datos de prueba)

El proyecto incluye un sistema de seeds reproducible e idempotente para poblar la base de datos con datos de prueba.

### Ejecutar seeds


# Aplicar migraciones a la DB
```bash
docker exec proyecto-proclade-backend-1 yarn prisma migrate deploy
```
# Poblar datos de prueba (opcional)
```bash
docker exec proyecto-proclade-backend-1 yarn prisma:seed
```

### Datos creados

| Tipo | Email | Contraseña | Rol |
|------|-------|------------|-----|
| Admin | admin@proclade.local | Admin123! | ADMIN |
| Usuario | user@proclade.local | User123! | USER |
| Batch (20) | test.user.001@test.com ... test.user.020@test.com | Test123! | USER |

### Estructura de seeds

```
backend/prisma/seeds/
├── seed.ts             # Orquestador principal
├── roles.seed.ts       # Seed de roles (ADMIN, USER)
├── admin-user.seed.ts  # Admin y usuario de pruebas
└── users-batch.seed.ts # 20 usuarios fake con @faker-js/faker
```
