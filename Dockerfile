FROM node:latest

WORKDIR /app

COPY index.js ./
COPY src ./src
COPY package*.json ./

RUN npm install --production

ENTRYPOINT [ "node", "index.js" ]
