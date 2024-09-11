

FROM node:20-bookworm-slim AS base

LABEL fly_launch_runtime="Node.js"
ENV NODE_ENV production

RUN apt-get update && apt-get install -y \
    # curl \
    openssl \
    sqlite3 \
    fuse3 \
    ca-certificates 
    # && rm -rf /var/lib/apt/lists/*


FROM base AS deps

WORKDIR /app

ADD package.json package-lock.json .npmrc ./
RUN npm install --include=dev

FROM base AS production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

FROM base AS build

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

FROM base

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV PORT="3000"
ENV NODE_ENV="production"
ENV PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1"

RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /app

RUN INTERNAL_COMMAND_TOKEN=$(openssl rand -hex 32) && \
  echo "INTERNAL_COMMAND_TOKEN=$INTERNAL_COMMAND_TOKEN" > .env

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/prisma /app/prisma

COPY --from=flyio/litefs:0.5.11 /usr/local/bin/litefs /usr/local/bin/litefs
COPY --from=litestream/litestream:latest /usr/local/bin/litestream /usr/local/bin/litestream
# RUN curl -L https://github.com/benbjohnson/litestream/releases/download/v0.3.8/litestream-v0.3.8-linux-amd64.tar.gz | tar -xz -C /usr/local/bin

ADD /etc/litefs.yml /etc/litefs.yml
ADD /etc/litestream.yml /etc/litestream.yml

RUN mkdir -p /data ${LITEFS_DIR}
    
ADD . .

CMD ["litefs", "mount"]
