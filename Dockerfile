# base node image
FROM node:20-bookworm-slim AS base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install sqlite and openssl for Prisma, fuse3 for litefs, and ca-certs for sqlite
RUN apt-get update && apt-get install -y openssl sqlite3 fuse3 ca-certificates

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /app

ADD package.json package-lock.json .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base AS production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

# Build the app for production
FROM base AS build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

# Set production environment variables
ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV PORT="3000"
ENV NODE_ENV="production"
ENV PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /app

# Copy production node_modules and the generated Prisma client
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

# Copy the built app and the folders and files needed in production
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json

# Prepare for litefs
COPY --from=flyio/litefs:0.5.11 /usr/local/bin/litefs /usr/local/bin/litefs
ADD litefs.yml /etc/litefs.yml

RUN mkdir -p /data ${LITEFS_DIR}

ADD . .

CMD ["litefs", "mount"]