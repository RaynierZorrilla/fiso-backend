# 📋 Requisitos del Proyecto Backend – FISO

## 📦 Requisitos del sistema
- **Node.js** v18 o superior  
- **npm** v9 o superior  
- **Docker** y **Docker Compose** instalados  
- **PostgreSQL** 14 o superior  

## 🧱 Tecnologías utilizadas
- **Lenguaje:** TypeScript  
- **Framework:** Express.js  
- **ORM:** TypeORM  
- **Base de datos:** PostgreSQL  
- **Autenticación:** Supabase (Auth)  
- **Control de acceso:** JWT con validación mediante `jwk-to-pem`  
- **Manejo de configuración:** dotenv (`.env`)  

## 📁 Estructura general del proyecto
```
src/
├── config/        # Configuración de la base de datos y entorno
├── entities/      # Entidades de TypeORM (User, Transaction, etc.)
├── middlewares/   # Middleware para autenticación, validación, etc.
├── routes/        # Archivos de rutas API REST
├── services/      # (Opcional) Lógica de negocio
└── index.ts       # Punto de entrada principal de la aplicación
```

## 📦 Dependencias principales
```bash
npm install express typeorm pg reflect-metadata dotenv jsonwebtoken jwks-rsa jwk-to-pem
npm install --save-dev typescript ts-node-dev @types/node @types/express
```

---

## 🐳 Docker
El proyecto utiliza **Docker** para orquestar el backend y la base de datos PostgreSQL.  
Esto garantiza que todos los entornos tengan la misma configuración y dependencias.

## 🔐 Supabase Auth
- El **login** y **registro** se realizan desde el **frontend** con Supabase.
- El **backend** valida el JWT enviado en el encabezado `Authorization`.
- Las rutas protegidas extraen el `sub` del token como `user.id`.

---

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
