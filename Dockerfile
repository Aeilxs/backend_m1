FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
RUN npm install -g @nestjs/cli
COPY . .
RUN npm run build
EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/main.js"]
