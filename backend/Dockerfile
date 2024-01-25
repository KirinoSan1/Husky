# syntax=docker/dockerfile:1

FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 443

COPY . .

ENV FRONTEND_URL=http://127.0.0.1:3000

ENV DB_URL=mongodb://mongoDB/Husky

CMD [ "npm", "start" ]