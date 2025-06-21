# Etapa base
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY ./src ./src

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
