FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx knex migrate:latest && npx knex seed:run && node src/server.js"]
