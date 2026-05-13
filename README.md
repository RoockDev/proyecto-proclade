# Proyecto Proclade

Proyecto base para el desarrollo de una plataforma web usando **Docker** como entorno principal de ejecución.


## 🧱 Tecnologías

- **Frontend:** React + Vite
- **Backend:** NestJS + Prisma
- **Base de datos:** PostgreSQL
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
- Aplica migraciones e inicializa los datos base del sistema.
- Levanta frontend, backend, base de datos y nginx.

La aplicación quedará disponible en: [http://localhost](http://localhost)

Antes de arrancar, revisa que existan los `.env` locales a partir de los `.env.example`.
En Docker el frontend debe usar `VITE_API_BASE_URL=/api` y el backend necesita un
`JWT_SECRET` largo y privado para poder iniciar.

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

## 📦 Ejecutar comandos dentro del contenedor (\`docker compose exec\`)

Se usa para ejecutar comandos dentro de un contenedor que ya está corriendo.

**1. Primero, ver los contenedores activos:**

```bash
docker ps
```

Verás algo como:
- `proyectoproclade-backend-1`
- `proyectoproclade-frontend-1`
- `proyectoproclade-db-1`

**2. Entrar al backend:**

```bash
docker compose exec backend sh
```
- Salir escribiendo: `exit`

**3. Ejecutar comandos directamente (sin entrar):**

- **Instalar una dependencia en el backend:**
  ```bash
  docker compose exec backend yarn add bcrypt
  ```

- **Instalar una dependencia de desarrollo:**
  ```bash
  docker compose exec backend yarn add -D @types/bcrypt
  ```

- **Ejecutar Prisma:**
  ```bash
  docker compose exec backend yarn prisma migrate dev
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

## Inicialización del sistema

El proyecto ya no carga usuarios fake ni datos de prueba de desarrollo al arrancar.
Durante `docker compose up --build`, el backend ejecuta una inicialización mínima e idempotente para dejar la plataforma utilizable:

- crea/verifica los roles base `ADMIN` y `USER`
- crea/actualiza un administrador inicial
- carga la base de conocimiento necesaria del chatbot

### Relanzar la inicialización manualmente

```bash
docker compose exec backend yarn prisma migrate deploy
docker compose exec backend yarn prisma:init-system
```

### Administrador inicial

El administrador inicial se configura en `backend/.env` con estas variables:

```env
JWT_SECRET=pon-aqui-un-secreto-largo-y-privado
SYSTEM_ADMIN_EMAIL=admin@equipo-puch.local
# Minimo 8 caracteres, una mayuscula, una minuscula y un numero
SYSTEM_ADMIN_PASSWORD=CambiaEsta123!
SYSTEM_ADMIN_NAME=Administrador
SYSTEM_ADMIN_SURNAME=Equipo PUCH
```

Si mantienes esos valores por defecto, cambia la contraseña tras el primer acceso.
