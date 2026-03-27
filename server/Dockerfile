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

# Run pending migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
