FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY packages/gelato-core/package.json packages/gelato-core/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm install
COPY . .
RUN npm run build -w @gelato/gelato-core
RUN npm run prisma:generate -w @gelato/api
RUN npm run build -w @gelato/api

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY packages/gelato-core/package.json packages/gelato-core/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm install --omit=dev
COPY --from=build /app/packages/gelato-core/dist packages/gelato-core/dist
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --schema apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]
