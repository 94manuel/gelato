FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/gelato-core/package.json packages/gelato-core/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY . .
RUN npm run build -w @gelato/gelato-core
RUN npm run build -w @gelato/api
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/packages/gelato-core/package.json packages/gelato-core/package.json
COPY --from=build --chown=node:node /app/packages/gelato-core/dist packages/gelato-core/dist
COPY --from=build --chown=node:node /app/apps/api/package.json apps/api/package.json
COPY --from=build --chown=node:node /app/apps/api/dist apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/prisma apps/api/prisma

USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
