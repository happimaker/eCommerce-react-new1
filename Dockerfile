FROM node:8-alpine
WORKDIR /var/app

COPY package.json package-lock.json ./
RUN npm install --no-cache

COPY index.js .
CMD ["node", "."]
