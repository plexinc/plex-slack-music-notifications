FROM node:10.16-alpine

RUN mkdir -p /app/src

ARG PORT=8000
ARG NODE_ENV=production

ENV DOCKER=1 PORT=$PORT NODE_ENV=$NODE_ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE $PORT

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