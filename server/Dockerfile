FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY .env.example .env.example

EXPOSE 3001

# Baseline init migration (safe no-op if already done), apply pending migrations, start server
CMD ["sh", "-c", "npx prisma migrate resolve --applied 20200101000000_init 2>/dev/null || true && npx prisma migrate deploy && node src/index.js"]
