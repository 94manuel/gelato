# Despliegue de producción en VPS - Ñam Gelato Lab

Esta versión está preparada para desplegar API y Web en Kubernetes usando PostgreSQL centralizado en el namespace `database`.

## Arquitectura de producción

```txt
namespace database
  postgres Service: postgres.database.svc.cluster.local:5432

namespace gelato
  gelato-api Deployment + Service :3001
  gelato-web Deployment + Service :3000
  gelato-api-migrate Job
  gelato-ingress Ingress NGINX

namespace argocd
  Application: gelato-recipes-platform
```

## URL interna de PostgreSQL

```env
DATABASE_URL="postgresql://gelato:TU_PASSWORD@postgres.database.svc.cluster.local:5432/gelato?schema=public"
```

## Variables de producción

El Secret `gelato-postgres-secret` no se versiona con credenciales reales. Debe crearse directamente en la VPS.

```bash
kubectl create namespace gelato --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic gelato-postgres-secret \
  -n gelato \
  --from-literal=DATABASE_URL='postgresql://gelato:TU_PASSWORD@postgres.database.svc.cluster.local:5432/gelato?schema=public' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Secret para GHCR

Si las imágenes de GHCR son privadas:

```bash
export GITHUB_PACKAGE_TOKEN='PEGA_AQUI_TU_TOKEN_CON_read:packages'

kubectl create secret docker-registry ghcr-secret \
  -n gelato \
  --docker-server=ghcr.io \
  --docker-username=94manuel \
  --docker-password="$GITHUB_PACKAGE_TOKEN" \
  --docker-email='tu-correo@dominio.com' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Primer despliegue manual

```bash
kubectl apply -k k8s/overlays/prod
kubectl get pods,svc,ingress,job -n gelato
```

## ArgoCD

```bash
kubectl apply -f argocd/gelato-platform-app.yaml
kubectl get applications.argoproj.io -n argocd
```

## Verificación

```bash
kubectl logs -n gelato deployment/gelato-api --tail=100
kubectl logs -n gelato deployment/gelato-web --tail=100
kubectl get ingress -n gelato
curl https://gelato.cybervestigio.com/api/health
```

## Migraciones

El Job `gelato-api-migrate` ejecuta:

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

En ArgoCD se ejecuta como hook `PreSync` antes de levantar la aplicación.
