FROM node:8-alpine
WORKDIR /var/app

COPY package.json package-lock.json ./
RUN npm install --no-cache

COPY src src
COPY users.json /var/users.json

CMD ["node", "src"]
