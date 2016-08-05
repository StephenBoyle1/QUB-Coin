FROM node:4

RUN npm install solc && npm install --unsafe-perm -g ethereumjs-testrpc@2.0.0 && npm install -g jasmine-node && npm install web3

RUN mkdir /app
WORKDIR /app