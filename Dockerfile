# Copyright (C) 2021 Edge Network Technologies Limited
# Use of this source code is governed by a GNU GPL-style license
# that can be found in the LICENSE.md file. All rights reserved.

#
# 1. Build the Vue app
#
FROM node:lts AS build

COPY *.config.js ./
COPY package*.json ./
RUN npm install

COPY index.html ./
COPY src src/
COPY public public/

ARG BLOCKCHAIN_API_URL
ARG BRIDGE_WALLET_ADDRESS
ARG EXPLORER_URL
ARG GOVERNANCE_URL
ARG INDEX_API_URL
ARG IS_TESTNET
ENV VITE_BLOCKCHAIN_API_URL=$BLOCKCHAIN_API_URL
ENV VITE_BRIDGE_WALLET_ADDRESS=$BRIDGE_WALLET_ADDRESS
ENV VITE_EXPLORER_URL=$EXPLORER_URL
ENV VITE_GOVERNANCE_URL=$GOVERNANCE_URL
ENV VITE_INDEX_API_URL=$INDEX_API_URL
ENV VITE_IS_TESTNET=$IS_TESTNET

RUN npm run build

#
# 2. Copy the files over and run it
#
FROM node:lts

WORKDIR /edge/wallet

COPY package*.json ./
RUN npm install --only=production

COPY server server/
COPY --from=build dist dist/

CMD ["npm", "start"]
