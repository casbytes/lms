#### BUILDER STAGE ####

FROM node:21-alpine3.18 AS builder

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

RUN npm run generate
RUN npm run build

#### PRODUCTION STAGE ####

FROM node:21-alpine3.18

WORKDIR /app
COPY package*.json .
RUN npm install --omit=dev
COPY --from=builder /app .

CMD ["npm", "run", "start"]
