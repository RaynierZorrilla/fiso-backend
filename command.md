# 🧰 Comandos útiles para el backend FISO

## 🔧 Instalación del proyecto

```bash
npm install


## Levantar proyecto con Docker
docker-compose up --build


## Parar los contenedores
docker-compose down


## Compilar proyecto manualmente
npm run build # Requiere tener PostgreSQL corriendo localmente y .env bien configurado.

## Reiniciar proyecto
docker-compose restart


# Comandos útiles para migraciones con TypeORM

## Generar una nueva migración

```
npm run typeorm migration:generate src/migrations/nombre-de-migracion
```

> Reemplaza `NombreDeLaMigracion` por un nombre descriptivo (sin espacios).

## Aplicar todas las migraciones pendientes

```
npm run migration:run
```

## Revertir la última migración aplicada

```
npm run migration:revert
```

---

Estos comandos utilizan la configuración personalizada de TypeORM definida en `src/config/data-source.ts` y las variables de entorno del archivo `.env`.

# Flujo recomendado para desarrollo local

## 1. Levanta solo la base de datos con Docker

```
docker-compose up -d postgres
```

## 2. Corre el backend localmente (con recarga automática)

```
npm run dev
```

## 3. Variables de entorno recomendadas para desarrollo local (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=fiso_user
DB_PASSWORD=fiso_pass
DB_NAME=fiso_db
```

## 4. Limpiar la base de datos (opcional, borra todos los datos)

```
docker-compose down -v
```

## 5. Reiniciar solo la base de datos

```
docker-compose restart postgres
```

---

Este flujo te permite desarrollar de forma ágil, con una base de datos aislada y un backend que recarga automáticamente los cambios.



