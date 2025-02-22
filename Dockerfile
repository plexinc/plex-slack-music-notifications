FROM node:20.13.0-alpine AS builder

ENV PORT=3000
WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn install

COPY . /app
RUN yarn run build

FROM node:20.13.0-alpine
WORKDIR /app
EXPOSE 3000

COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/dist/server.js ./server.js

CMD [ 'node' 'server.js' ]
