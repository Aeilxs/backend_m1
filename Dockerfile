FROM node:18-alpine

WORKDIR /app

# Étape 1 — install des dépendances
COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g @nestjs/cli

# Étape 2 — ajout du code source
COPY . .
RUN npm run build

# Étape 3 — expose & run
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/main.js"]
