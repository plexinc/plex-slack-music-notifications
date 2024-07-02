FROM node:20.13.0-alpine

ARG PORT=3000
WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn run build

CMD [ "yarn", "start" ]
