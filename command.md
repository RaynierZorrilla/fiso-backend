# 🧰 Comandos útiles para el backend FISO

## 🔧 Instalación del proyecto
```bash
npm install
```

## 🚀 Levantar proyecto con Docker
```bash
docker-compose up --build
```

## ⏹️ Parar los contenedores
```bash
docker-compose down
```

## 🛠 Compilar proyecto manualmente
> Requiere PostgreSQL corriendo localmente y `.env` configurado.
```bash
npm run build
```

## 🔄 Reiniciar proyecto
```bash
docker-compose restart
```

---

# ⚙️ Migraciones con TypeORM

## 📜 Generar una nueva migración
```bash
npm run typeorm migration:generate src/migrations/NombreDeLaMigracion
```
> Reemplaza `NombreDeLaMigracion` por un nombre descriptivo (sin espacios).

## 📥 Aplicar migraciones pendientes
```bash
npm run migration:run
```

## ↩️ Revertir la última migración
```bash
npm run migration:revert
```

---

# 🔄 Flujo recomendado para desarrollo local

## 1️⃣ Levantar solo la base de datos
```bash
docker-compose up -d postgres
```

## 2️⃣ Ejecutar el backend en modo desarrollo (hot reload)
```bash
npm run dev
```

## 3️⃣ Variables de entorno recomendadas (`.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=fiso_user
DB_PASSWORD=fiso_pass
DB_NAME=fiso_db
```

## 4️⃣ Limpiar la base de datos (elimina datos y contenedor)
```bash
docker-compose down -v
```

## 5️⃣ Reiniciar solo la base de datos
```bash
docker-compose restart postgres
```

---

💡 **Tip:** Este flujo te permite desarrollar de forma ágil, manteniendo la base de datos aislada y el backend en modo recarga automática para reflejar los cambios al instante.
