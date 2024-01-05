# syntax=docker/dockerfile:1

FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 3000

COPY . .

ENV REACT_APP_BACKEND_URL=https://husky-backend

CMD [ "npm", "start" ]