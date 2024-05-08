FROM node:20.14.0-alpine

ARG PORT=3000
WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn run build

CMD [ "yarn", "start" ]
