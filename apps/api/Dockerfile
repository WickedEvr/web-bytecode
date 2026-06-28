FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de workspaces
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Instalar todas las dependencias
RUN npm install --no-audit --no-fund

# Copiar el código fuente de la API
COPY apps/api/ ./apps/api/

# Compilar TypeScript en el workspace de la API
RUN npm run build -w @bytecode/api

# Etapa de producción para reducir el tamaño de la imagen final
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Instalar solo dependencias de producción
RUN npm install --omit=dev --no-audit --no-fund

# Copiar el build compilado y scripts necesarios
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/scripts ./apps/api/scripts

EXPOSE 4000
CMD ["npm", "run", "start", "-w", "@bytecode/api"]
