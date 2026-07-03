FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY packages/gelato-core/package.json packages/gelato-core/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install
COPY . .
RUN npm run build -w @gelato/gelato-core
RUN npm run build -w @gelato/web

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY packages/gelato-core/package.json packages/gelato-core/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --omit=dev
COPY --from=build /app/packages/gelato-core/dist packages/gelato-core/dist
COPY --from=build /app/apps/web/.next apps/web/.next
COPY --from=build /app/apps/web/public apps/web/public
COPY --from=build /app/apps/web/next.config.ts apps/web/next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@gelato/web"]
