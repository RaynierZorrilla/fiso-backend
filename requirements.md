# 📋 Requisitos del Proyecto Backend – FISO

## 📦 Requisitos del sistema

- Node.js v18 o superior
- npm v9 o superior
- Docker y Docker Compose instalados
- PostgreSQL 14 o superior

## 🧱 Tecnologías utilizadas

- **Lenguaje:** TypeScript
- **Framework:** Express.js
- **ORM:** TypeORM
- **Base de datos:** PostgreSQL
- **Autenticación:** Supabase (Auth)
- **Control de acceso:** JWT con validación mediante jwk-to-pem
- **Manejo de configuración:** dotenv (.env)

## 📁 Estructura general del proyecto

```
src/
├── config/ # Configuración de la base de datos y entorno
├── entities/ # Entidades de TypeORM (User, Transaction, etc.)
├── middlewares/ # Middleware para autenticación, validación, etc.
├── routes/ # Archivos de rutas API REST
├── services/ # (Opcional) lógica de negocio
└── index.ts # Punto de entrada principal de la aplicación
```


## 📦 Dependencias principales

```bash
npm install express typeorm pg reflect-metadata dotenv jsonwebtoken jwks-rsa jwk-to-pem
npm install --save-dev typescript ts-node-dev @types/node @types/express


🐳 Docker
Se utiliza Docker para orquestar el backend y la base de datos PostgreSQL.

🔐 Supabase Auth
Login/registro se realiza desde el frontend con Supabase

El backend verifica el JWT enviado en el header Authorization

Las rutas protegidas extraen el sub del token como user.id