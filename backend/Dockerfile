# syntax=docker/dockerfile:1

FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 443

COPY . .

ENV BASE_URL=https://127.0.0.1

ENV DB_URL=mongodb://mongoDB/Husky

CMD [ "npm", "start" ]