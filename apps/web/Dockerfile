FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/gelato-core/package.json packages/gelato-core/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build -w @gelato/gelato-core
RUN npm run build -w @gelato/web

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public apps/web/public

USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
