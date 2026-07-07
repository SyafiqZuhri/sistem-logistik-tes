FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
# PERUBAHANNYA DI SINI: Kita suruh copy SELURUH isi folder
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
