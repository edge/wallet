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

FROM node:lts
MAINTAINER Adam K Dean <adam@edge.network>

WORKDIR /edge/wallet

COPY package*.json ./
RUN npm install

COPY server server/
COPY www www/

CMD ["npm", "start"]
