FROM node:7.10

WORKDIR /app

ENV NODE_ENV=production

ADD ./package.json .

ADD ./yarn.lock .

RUN yarn install

ADD ./public/*.* ./public/

ADD ./server/*.js ./server/

CMD ["node", "server/pipelineClientServer.js"]

EXPOSE  3100
