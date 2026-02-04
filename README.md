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
docker exec -it proyecto-proclade-backend-1 sh
```
- Salir escribiendo: `exit`

**3. Ejecutar comandos directamente (sin entrar):**

- **Instalar una dependencia en el backend:**
  ```bash
  docker exec -it proyecto-proclade-backend-1 yarn add bcrypt
  ```

- **Instalar una dependencia de desarrollo:**
  ```bash
  docker exec -it proyecto-proclade-backend-1 yarn add -D @types/bcrypt
  ```

- **Ejecutar Prisma:**
  ```bash
  docker exec -it proyecto-proclade-backend-1 yarn prisma migrate dev
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