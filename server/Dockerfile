FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY .env.example .env.example

EXPOSE 3001

# Push schema to DB then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/index.js"]
