# Etapa 1 – build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build # si aplica (TS)

# Etapa 2 – runtime optimizado
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/index.js"]
