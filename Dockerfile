FROM node:8-alpine
WORKDIR /var/app

COPY package.json package-lock.json ./
RUN npm install --no-cache

COPY src src
CMD ["node", "src"]
