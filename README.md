# Ñam Gelato Lab

Web completa para formular, editar, visualizar, escalar y balancear recetas de gelato. Incluye backend NestJS con DDD, frontend Next.js con Atomic Design, paquete de dominio compartido para cálculos técnicos, PostgreSQL, Docker, Kubernetes y ArgoCD.


## Producción en VPS

El despliegue de producción está documentado en [`docs/PRODUCTION_DEPLOYMENT.md`](docs/PRODUCTION_DEPLOYMENT.md).

Cambios importantes para producción:

- PostgreSQL ya no se despliega dentro del namespace `gelato`. La API consume el PostgreSQL central `postgres.database.svc.cluster.local`.
- Las credenciales reales de base de datos se crean como Secret en la VPS, no se versionan en Git.
- Las migraciones Prisma se ejecutan mediante el Job `gelato-api-migrate`.
- API y Web se despliegan en pods separados detrás de Ingress NGINX.
- ArgoCD apunta al overlay `k8s/overlays/prod`.

## Funcionalidades principales

- Crear recetas por tipo: base leche, fiordilatte, vainilla, café, chocolate, fruta con leche, lulo, sorbete, yogur, frutos secos/pistacho y vegano.
- Ver recetas creadas, abrirlas para edición, actualizarlas y eliminarlas.
- Agregar notas de ensayo a cada receta con calificación de 1 a 5.
- Guardar historial automático cada vez que se crea, edita, comenta o aprueba una receta.
- Comparar promedio y mejor calificación para encontrar la receta más vendible.
- Aprobar una receta como lista para producción y mostrarla en una sección exclusiva para el área productiva.
- Editar ingredientes y gramos en vivo, separados entre **ingredientes base obligatorios** y **saborizantes/aditivos de sabor**.
- Escalar automáticamente a 1 kg, 2 kg, 3 kg, 5 kg o cualquier peso manual.
- Calcular gramos escalados, porcentaje de cada ingrediente y porcentaje total de base vs saborizante.
- Validar si la receta está balanceada usando indicadores técnicos:
  - Sólidos totales.
  - Grasa.
  - Sólidos lácteos no grasos.
  - Azúcares totales.
  - Lactosa.
  - Neutro / estabilizante activo.
  - PAC.
  - POD.
- Mostrar puntaje de balance, estado técnico, costo total de lote y recomendaciones automáticas.
- Abrir un aviso explicativo por cada indicador técnico para saber qué mide, para qué sirve y cómo corregirlo.
- Crear ingredientes propios, editar composición técnica y precio base COP/kg.
- Crear proveedores, asignar puntaje de calidad, precio, servicio y entrega.
- Registrar precios por ingrediente/proveedor y seleccionar el mejor proveedor según puntaje total.
- Crear un neutro propio con portador, estabilizante, emulsificante y fibra.
- Calcular si el neutro está balanceado y su dosis en gramos por kg de mezcla.
- Guardar recetas y neutros en PostgreSQL desde el backend.
- Swagger disponible en `/api/docs`, con alias local `/docs` y documento OpenAPI en `/api/docs-json`.

## Arquitectura

```txt
gelato-recipes-platform/
├─ apps/
│  ├─ api/                 # NestJS + DDD + Prisma + PostgreSQL
│  └─ web/                 # Next.js App Router + Atomic Design
├─ packages/
│  └─ gelato-core/         # Dominio compartido: cálculos, ingredientes, rangos, indicadores y puntajes
├─ k8s/base/               # Manifiestos Kubernetes
├─ argocd/                 # Application para ArgoCD
├─ scripts/                # Scripts PowerShell y Bash
└─ docker-compose.yml      # PostgreSQL local
```

### Backend DDD

```txt
apps/api/src/modules/recipes/
├─ domain/
│  ├─ entities/
│  ├─ ports/
│  └─ services/
├─ application/
│  ├─ dto/
│  └─ use-cases/
├─ infrastructure/
│  └─ persistence/prisma/
└─ interfaces/http/
```

### Frontend Atomic Design

```txt
apps/web/components/
├─ atoms/       # Button, Input, Select, Badge
├─ molecules/   # filas de ingrediente, métricas
├─ organisms/   # RecipeBuilder, NeutralBuilder, BalancePanel
└─ templates/   # GelatoDashboardTemplate
```


### Separación de receta por secciones

Cada ingrediente puede tener `section`:

```txt
base   = ingredientes requeridos para estructura: leche, agua, crema, grasa, azúcares, leche en polvo, neutro, fibra.
flavor = ingredientes que cambian el sabor: café, lulo, chocolate, fruta, vainilla, pistacho, cacao, etc.
```

Si una receta antigua no trae `section`, el sistema la clasifica automáticamente: los ingredientes con categoría `flavor` pasan a saborizantes y los demás quedan como base.

## Fórmulas técnicas implementadas

El paquete `@gelato/gelato-core` calcula la receta de forma centralizada para backend y frontend.

### Escalado

```txt
factor = peso_deseado / peso_base_receta
gramos_escalados = gramos_base * factor
porcentaje_ingrediente = gramos_escalados / peso_deseado * 100
```

### Sólidos totales

```txt
sólidos_totales = grasa + sólidos_lácteos_no_grasos + sacarosa + dextrosa + glucosa + fructosa + lactosa + estabilizante + otros_sólidos
```

### PAC

```txt
PAC = (sacarosa*1.00 + dextrosa*1.90 + glucosa*1.10 + fructosa*1.90 + lactosa*1.00) / peso_total * 100
```

### POD

```txt
POD = (sacarosa*1.00 + dextrosa*0.70 + glucosa*0.45 + fructosa*1.70 + lactosa*0.16) / peso_total * 100
```

## Ejecución local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Levantar PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Configurar variables

Copia `.env.example` a `apps/api/.env` o exporta las variables:

```bash
DATABASE_URL="postgresql://gelato:gelato123@localhost:5432/gelato?schema=public"
PORT=3001
CORS_ORIGIN=http://localhost:3000
# Opcional: si no la configuras, Next.js proxya /api hacia http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Generar Prisma y crear tablas

```bash
npm run prisma:generate -w @gelato/api
npm run prisma:push -w @gelato/api
```

### 5. Ejecutar backend y frontend

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:3001/api/health`
- Swagger: `http://localhost:3001/api/docs`
- Alias Swagger local: `http://localhost:3001/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs-json`

## Swagger / OpenAPI

Rutas disponibles:

```txt
Local backend:        http://localhost:3001/api/docs
Alias local backend:  http://localhost:3001/docs
OpenAPI JSON:         http://localhost:3001/api/docs-json
Kubernetes Ingress:   http://gelato.local/api/docs
Alias Ingress:        http://gelato.local/docs
```

Desde el frontend aparece un botón **Swagger API** en la parte superior.

## Endpoints principales

```txt
GET    /api/health
GET    /api/recipes
GET    /api/recipes/production
GET    /api/recipes/:id/timeline
POST   /api/recipes/:id/notes
POST   /api/recipes/:id/approve-production
GET    /api/recipes/ingredients
GET    /api/catalog/ingredients
POST   /api/catalog/ingredients/seed
POST   /api/catalog/ingredients
PUT    /api/catalog/ingredients/:id
DELETE /api/catalog/ingredients/:id
GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id
POST   /api/suppliers/:id/prices
PUT    /api/supplier-prices/:id
DELETE /api/supplier-prices/:id
GET    /api/recipes/examples/coffee
GET    /api/recipes/examples/:type
POST   /api/recipes/calculate
POST   /api/recipes/scale
POST   /api/recipes
PUT    /api/recipes/:id
DELETE /api/recipes/:id

GET    /api/neutrals
POST   /api/neutrals/calculate
POST   /api/neutrals
```

## Ejemplo curl: calcular café 1 kg

```bash
curl -X POST http://localhost:3001/api/recipes/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Gelato de café",
    "type":"coffee",
    "targetWeightGrams":1000,
    "ingredients":[
      {"ingredientId":"leche-entera","grams":520,"section":"base"},
      {"ingredientId":"crema-35","grams":150,"section":"base"},
      {"ingredientId":"leche-polvo-descremada","grams":70,"section":"base"},
      {"ingredientId":"sacarosa","grams":120,"section":"base"},
      {"ingredientId":"dextrosa","grams":55,"section":"base"},
      {"ingredientId":"neutro-comercial","grams":5,"section":"base"},
      {"ingredientId":"cafe-extracto","grams":80,"section":"flavor"}
    ]
  }'
```


## Ensayos, historial y producción

Cada receta guardada queda como versión inicial `v1`. Desde la pantalla de edición puedes agregar notas de ensayo con calificación de 1 a 5. Cada nota crea una entrada en el historial, sin perder la secuencia de pruebas.

Cuando cambias la fórmula y guardas, el sistema aumenta `versionNumber`, crea un evento `UPDATED` y retira la aprobación de producción hasta que la nueva versión vuelva a aprobarse.

Cuando una receta obtiene la calificación esperada y está lista para venderse, usa **Aprobar y enviar a producción**. Esa acción crea un evento `PRODUCTION_APPROVED` y la receta aparece en la pestaña **Producción**, con gramos escalados, versión aprobada, costo del lote y notas operativas para el equipo de producción.

Eventos de historial:

```txt
CREATED              = receta creada
UPDATED              = fórmula modificada; se crea nueva versión
NOTE_ADDED           = nota de ensayo con calificación
PRODUCTION_APPROVED  = receta aprobada para producción
```

## Despliegue en Kubernetes con Minikube

### PowerShell

```powershell
./scripts/k8s-minikube.ps1
```

### Bash

```bash
chmod +x scripts/k8s-minikube.sh
./scripts/k8s-minikube.sh
```

Después agrega en tu archivo `hosts`:

```txt
<IP_DE_MINIKUBE> gelato.local
```

Obtén la IP con:

```bash
minikube ip
```

Abre:

```txt
http://gelato.local
http://gelato.local/api/docs
http://gelato.local/docs
```

## Despliegue manual Kubernetes

```bash
docker build -t gelato-api:local -f apps/api/Dockerfile .
docker build -t gelato-web:local -f apps/web/Dockerfile .
minikube addons enable ingress
minikube image load gelato-api:local
minikube image load gelato-web:local
kubectl apply -f k8s/base
kubectl get all -n gelato
```

## ArgoCD

Edita `argocd/gelato-platform-app.yaml` y cambia:

```yaml
repoURL: https://github.com/TU_USUARIO/gelato-recipes-platform.git
```

Luego aplica:

```bash
kubectl apply -f argocd/gelato-platform-app.yaml
```

## Nota técnica

Los rangos incluidos son una base para formular y corregir recetas, pero el resultado final debe validarse con proceso real: pasteurización, maduración, mantecar, abatir, conservación y vitrina. Ajusta rangos e ingredientes según tus insumos reales y comportamiento en tu máquina.


## Corrección importante para desarrollo local

El backend NestJS debe importar `@gelato/gelato-core` como paquete de workspace ya compilado, no como ruta directa a `packages/gelato-core/src`. Por eso el comando raíz `npm run dev` primero compila `gelato-core` y luego inicia tres procesos: watcher del core, API NestJS y Web Next.js.

Si aparece un error similar a `Cannot find module apps/api/dist/main`, borra la carpeta `apps/api/dist` y ejecuta:

```powershell
npm run build -w @gelato/gelato-core
npm run dev -w @gelato/api
```

O desde la raíz:

```powershell
npm run dev
```

## Solución para errores de `Cannot find module` en desarrollo

El API usa `node --watch` + `ts-node` en desarrollo para ejecutar directamente `apps/api/src/main.ts` y evitar errores de caché del `dist` de Nest en Windows. Si aparece un error similar, limpia los artefactos y vuelve a iniciar:

```powershell
Remove-Item -Recurse -Force .\apps\api\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\packages\gelato-core\dist -ErrorAction SilentlyContinue
npm run build -w @gelato/gelato-core
npm run prisma:generate -w @gelato/api
npm run dev
```

Para producción o Docker se mantiene el build normal de Nest:

```powershell
npm run build -w @gelato/api
npm run start:prod -w @gelato/api
```

## Flujo recomendado para usar la nueva sección de costos

1. Entra a **Ingredientes y proveedores**.
2. Presiona **Crear catálogo base** para guardar los ingredientes técnicos iniciales en PostgreSQL.
3. Crea tus proveedores y asigna puntajes de 0 a 100 en calidad, precio, servicio y entrega.
4. En **Precios por proveedor**, selecciona ingrediente + proveedor y registra el precio COP/kg.
5. En **Crear receta**, selecciona los ingredientes. La receta tomará el mejor precio disponible y recalculará el costo total del lote.
6. En **Recetas creadas**, abre cualquier receta guardada para editarla, cambiarla a 1 kg, 2 kg o cualquier peso, y volver a guardar.

El puntaje de proveedor se calcula así:

```txt
puntaje_total = calidad*35% + precio*30% + servicio*20% + entrega*15%
```

Para cada ingrediente, el proveedor recomendado es el que tenga mayor `puntaje_total`. Si hay empate, se usa el menor precio por kg.


## Corrección 2026-07-02 - arranque TypeScript del catálogo

Se corrigió el caso en el que `ts-node` marcaba el error `TS2345` en `ingredient-catalog.controller.ts` al sembrar ingredientes base. La causa era que el parámetro opcional `id` del caso de uso `CreateIngredientUseCase` quedaba inferido como tipo UUID generado por `randomUUID()`, pero los ingredientes base usan identificadores legibles como `leche-entera`, `sacarosa` y `dextrosa`. Ahora el parámetro se tipa explícitamente como `string`, compatible con IDs internos y IDs semilla.

## Corrección frontend secciones receta

Esta versión evita el error `Cannot read properties of undefined (reading 'baseWeightGrams')` calculando el resumen de secciones en el frontend mediante `apps/web/lib/recipe-sections.ts`. Si el balance del paquete compartido llega sin `sections` por caché o compilación vieja, la pantalla calcula base/saborizante desde los ingredientes actuales y no queda en blanco.


## Historial de versiones, ensayos y producción

La plataforma permite trabajar la receta como un laboratorio de pruebas:

- Cada creación o edición de fórmula genera una versión: v1, v2, v3, etc.
- Cada nota de ensayo queda asociada a la versión activa y acepta calificación decimal de 1.00 a 5.00.
- Desde la sección de ensayos puedes seleccionar cualquier versión histórica, ver exactamente qué ingredientes y gramos se usaron, restaurarla como nueva versión actual o aprobar esa versión específica para producción.
- Si estás en v6 y restauras v2, el sistema crea una nueva v7 basada en la fórmula de v2. No se borra la historia.
- Si apruebas v2 para producción mientras la receta actual está en v6, producción ve la fórmula exacta de v2 mediante `productionSnapshot`.

Endpoints principales:

```txt
GET  /api/recipes/:id/timeline
POST /api/recipes/:id/notes
POST /api/recipes/:id/approve-production
POST /api/recipes/:id/versions/:versionNumber/restore
POST /api/recipes/:id/versions/:versionNumber/approve-production
GET  /api/recipes/production
```

Después de esta actualización vuelve a ejecutar Prisma:

```powershell
npm run prisma:generate -w @gelato/api
npm run prisma:push -w @gelato/api
```

## GitOps con GitHub Actions + ArgoCD

Repositorio configurado para despliegue continuo:

```txt
git@github.com:94manuel/gelato.git
```

El despliegue queda separado en pods diferentes:

```txt
gelato-api  = backend NestJS, puerto 3001
gelato-web  = frontend Next.js, puerto 3000
gelato-postgres = base de datos PostgreSQL
```

### Flujo automático al hacer push a `main`

1. Haces `git push origin main`.
2. GitHub Actions ejecuta `.github/workflows/gitops-deploy.yml`.
3. El workflow construye dos imágenes Docker separadas:

```txt
ghcr.io/94manuel/gelato-api:sha-xxxxxxx
ghcr.io/94manuel/gelato-web:sha-xxxxxxx
```

4. También publica tags flotantes:

```txt
ghcr.io/94manuel/gelato-api:main
ghcr.io/94manuel/gelato-web:main
```

5. El workflow actualiza `k8s/overlays/prod/kustomization.yaml` con el tag `sha-xxxxxxx` y hace commit automático con `[skip ci]`.
6. ArgoCD detecta el cambio en `main` y sincroniza el cluster.
7. Kubernetes actualiza `gelato-api` y `gelato-web` por separado.

Este flujo evita el problema típico de usar siempre `:main`, porque Kubernetes solo hace rollout cuando cambia el manifiesto. Por eso producción usa tags inmutables `sha-xxxxxxx`.

### Estructura Kubernetes

```txt
k8s/
├─ base/
│  ├─ 00-namespace.yaml
│  ├─ 01-postgres-secret.yaml
│  ├─ 02-postgres.yaml
│  ├─ 03-api.yaml        # Deployment + Service API
│  ├─ 04-web.yaml        # Deployment + Service Web
│  ├─ 05-ingress.yaml
│  └─ kustomization.yaml
└─ overlays/
   ├─ local/
   │  └─ kustomization.yaml   # usa gelato-api:local y gelato-web:local
   └─ prod/
      └─ kustomization.yaml   # usa ghcr.io/94manuel/* con tags sha
```

### Configurar GitHub Actions

En el repositorio de GitHub debes permitir que Actions pueda escribir commits y paquetes:

```txt
Settings > Actions > General > Workflow permissions
- Read and write permissions
- Allow GitHub Actions to create and approve pull requests: opcional
```

El workflow usa `GITHUB_TOKEN`, por eso no necesitas crear un PAT para publicar en GHCR si el repositorio tiene permisos de paquetes habilitados.

Si GHCR queda privado, tienes dos opciones:

1. Cambiar los paquetes `gelato-api` y `gelato-web` a públicos en GitHub Packages.
2. Crear un `imagePullSecret` en Kubernetes con un token que tenga permiso `read:packages`:

```bash
kubectl create secret docker-registry ghcr-pull-secret \
  -n gelato \
  --docker-server=ghcr.io \
  --docker-username=94manuel \
  --docker-password=TU_GITHUB_TOKEN_READ_PACKAGES
```

Si usas imágenes privadas y agregas `imagePullSecrets`, aplícalo como patch en el Deployment o ajusta los manifiestos según tu cluster.

### Configurar ArgoCD con repo SSH

La Application ya apunta a:

```yaml
repoURL: git@github.com:94manuel/gelato.git
targetRevision: main
path: k8s/overlays/prod
```

Primero registra el repo en ArgoCD. En PowerShell:

```powershell
.\scripts\gelato-deploy.ps1 repo-add -SshPrivateKeyPath C:\Users\ROGSTRIX\.ssh\argocd_gelato
```

En Bash:

```bash
SSH_PRIVATE_KEY_PATH=~/.ssh/argocd_gelato ./scripts/gelato-deploy.sh repo-add
```

Luego aplica la Application:

```powershell
.\scripts\gelato-deploy.ps1 apply-argocd
```

O en Bash:

```bash
./scripts/gelato-deploy.sh apply-argocd
```

Sincroniza manualmente cuando quieras:

```powershell
.\scripts\gelato-deploy.ps1 sync
```

Consulta estado:

```powershell
.\scripts\gelato-deploy.ps1 status
```

### CLI de despliegue

PowerShell:

```powershell
.\scripts\gelato-deploy.ps1 help
.\scripts\gelato-deploy.ps1 deploy-local
.\scripts\gelato-deploy.ps1 build-push -Tag sha-prueba001
.\scripts\gelato-deploy.ps1 apply-argocd
.\scripts\gelato-deploy.ps1 sync
.\scripts\gelato-deploy.ps1 rollback
```

Bash:

```bash
./scripts/gelato-deploy.sh help
./scripts/gelato-deploy.sh deploy-local
TAG=sha-prueba001 ./scripts/gelato-deploy.sh build-push
./scripts/gelato-deploy.sh apply-argocd
./scripts/gelato-deploy.sh sync
./scripts/gelato-deploy.sh rollback
```

### Despliegue local en Minikube

```powershell
.\scripts\gelato-deploy.ps1 deploy-local
```

Ese comando:

1. Activa Ingress.
2. Construye `gelato-api:local`.
3. Construye `gelato-web:local`.
4. Carga ambas imágenes en Minikube.
5. Aplica `k8s/overlays/local`.
6. Espera rollout de PostgreSQL, API y Web.

### Producción con ArgoCD

```bash
kubectl apply -f argocd/gelato-platform-app.yaml
```

ArgoCD observará `k8s/overlays/prod`. Cada vez que `main` cambie, GitHub Actions actualizará el tag SHA y ArgoCD hará el despliegue automático.
