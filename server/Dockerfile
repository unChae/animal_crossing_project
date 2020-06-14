FROM node:12

WORKDIR home/ubuntu/AnimalCrossing/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 443
EXPOSE 80

CMD [ "node", "app.js" ]