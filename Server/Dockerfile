FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g ts-node

COPY . .

ENV SPOTIFY_CLIENT_ID="b5497b2f8f6441fa8449f7a108920552"

ENV SPOTIFY_CLIENT_SECRET="0cbde209fec24b03bfddf4a7c4515e30"

ENV SPOTIFY_SECRET_KEY_TOKEN="Spotify123Token123In123theapptry"

ENV DB_CON="mongodb://mongo:27017/solmate"

EXPOSE 3001

CMD [ "npm" ,"start" ]