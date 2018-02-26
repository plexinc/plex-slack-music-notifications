FROM node:8

RUN mkdir -p /usr/src/app

ARG PORT=10000
ARG NODE_ENV=production

ENV PORT=$PORT NODE_ENV=$NODE_ENV PATH=/usr/src/node_modules/.bin:$PATH

EXPOSE $PORT

CMD [ "npm", "start" ]

WORKDIR /usr/src
COPY package.json package-lock.json ./
RUN npm install
ENV PATH /usr/src/node_modules/.bin:$PATH

WORKDIR /usr/src/app
COPY . .
