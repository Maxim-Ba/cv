#STAGE 1
FROM node:21.6-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

CMD [ "node", "dist/balashov-cv-client/server/server.mjs" ]

EXPOSE 4000
