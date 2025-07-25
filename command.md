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



