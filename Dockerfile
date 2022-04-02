FROM node:16.14-alpine

RUN mkdir -p /app/src

ARG PORT=8080

ENV DOCKER=1 PORT=$PORT NODE_ENV=$NODE_ENV PATH=/app/node_modules/.bin:$PATH

WORKDIR /app
COPY .npmrc .yarnclean .yarnrc package.json yarn.lock ./
RUN yarn --frozen-lockfile --non-interactive && \
    yarn cache clean && \
    rm .npmrc yarn.lock
ENV PATH /usr/src/node_modules/.bin:$PATH

WORKDIR /app/src
COPY . .
RUN rm .npmrc yarn.lock

CMD [ "yarn", "start" ]
