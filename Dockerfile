# Dockerfile - Sin package-lock.json
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Usar npm install en lugar de npm ci
RUN npm install --only=production

# Copiar código fuente
COPY src/ ./src/

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

CMD ["node", "src/app.js"]