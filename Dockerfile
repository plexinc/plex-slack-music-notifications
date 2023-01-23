FROM node:16.14-alpine

ARG PORT=3000
WORKDIR /app
COPY . /app
RUN yarn install && yarn run build

CMD [ "yarn", "start" ]
