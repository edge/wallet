#                  $$\
#                  $$ |
#   $$$$$$\   $$$$$$$ | $$$$$$\   $$$$$$\
#  $$  __$$\ $$  __$$ |$$  __$$\ $$  __$$\
#  $$$$$$$$ |$$ /  $$ |$$ /  $$ |$$$$$$$$ |
#  $$   ____|$$ |  $$ |$$ |  $$ |$$   ____|
#  \$$$$$$$\ \$$$$$$$ |\$$$$$$$ |\$$$$$$$\
#   \_______| \_______| \____$$ | \_______|
#                      $$\   $$ |
# © 2021 Edge Network  \$$$$$$  |
#   Technologies Ltd.   \______/

#
# 1. Build the Vue app
#
FROM node:lts AS build
MAINTAINER Adam K Dean <adam@edge.network>

COPY *.config.js ./
COPY package*.json ./
RUN npm install

COPY src src/
COPY public public/
RUN npm run build

#
# 2. Copy the files over and run it
#
FROM node:lts
MAINTAINER Adam K Dean <adam@edge.network>

WORKDIR /edge/wallet

COPY package*.json ./
RUN npm install --only=production

COPY server server/
COPY --from=build dist dist/

CMD ["npm", "start"]
