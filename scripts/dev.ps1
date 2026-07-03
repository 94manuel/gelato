$ErrorActionPreference = "Stop"
npm install
npm run build -w @gelato/gelato-core
npm run prisma:generate -w @gelato/api
Write-Host "Inicia Postgres local con: docker compose up -d postgres"
Write-Host "Luego ejecuta: npm run dev"
