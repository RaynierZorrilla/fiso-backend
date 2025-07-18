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


🗃️ Migraciones con TypeORM
#Generar una nueva migración

docker-compose exec backend npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate src/migrations/NombreDeMigracion -d src/config/data-source.ts

#Ejecutar migraciones pendientes
docker-compose exec backend npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source.ts

#Revertir la última migración
docker-compose exec backend npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:revert -d src/config/data-source.ts





