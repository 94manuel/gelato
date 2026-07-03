#!/usr/bin/env bash
set -euo pipefail

COMMAND="${1:-help}"
REGISTRY="${REGISTRY:-ghcr.io}"
OWNER="${OWNER:-94manuel}"
API_IMAGE="${API_IMAGE:-gelato-api}"
WEB_IMAGE="${WEB_IMAGE:-gelato-web}"
TAG="${TAG:-local}"
NAMESPACE="${NAMESPACE:-gelato}"
ARGO_NAMESPACE="${ARGO_NAMESPACE:-argocd}"
APP_NAME="${APP_NAME:-gelato-recipes-platform}"
REPO_URL="${REPO_URL:-git@github.com:94manuel/gelato.git}"
SSH_PRIVATE_KEY_PATH="${SSH_PRIVATE_KEY_PATH:-}"

api_image() {
  if [[ "$TAG" == "local" ]]; then echo "gelato-api:local"; else echo "$REGISTRY/$OWNER/$API_IMAGE:$TAG"; fi
}
web_image() {
  if [[ "$TAG" == "local" ]]; then echo "gelato-web:local"; else echo "$REGISTRY/$OWNER/$WEB_IMAGE:$TAG"; fi
}

help() {
  cat <<EOF
Gelato deployment CLI

Comandos:
  help          Muestra esta ayuda
  build         Construye imágenes Docker api/web
  push          Publica imágenes api/web en GHCR
  build-push    Construye y publica imágenes
  deploy-local  Despliega en Minikube con imágenes locales y overlay local
  repo-add      Registra el repo SSH en ArgoCD usando SSH_PRIVATE_KEY_PATH
  apply-argocd  Aplica la Application de ArgoCD
  sync          Fuerza sincronización de ArgoCD
  status        Muestra estado Kubernetes y ArgoCD si está disponible
  rollback      Rollback de deploy/api y deploy/web al revision anterior

Ejemplos:
  ./scripts/gelato-deploy.sh deploy-local
  TAG=sha-abc1234 ./scripts/gelato-deploy.sh build-push
  SSH_PRIVATE_KEY_PATH=~/.ssh/argocd_gelato ./scripts/gelato-deploy.sh repo-add
  ./scripts/gelato-deploy.sh apply-argocd
  ./scripts/gelato-deploy.sh sync
EOF
}

build() {
  echo "Building API image: $(api_image)"
  docker build -t "$(api_image)" -f apps/api/Dockerfile .
  echo "Building Web image: $(web_image)"
  docker build -t "$(web_image)" -f apps/web/Dockerfile .
}

push_images() {
  if [[ "$TAG" == "local" ]]; then echo "Para push usa TAG=sha-xxxx o TAG=main; local no se publica." >&2; exit 1; fi
  docker push "$(api_image)"
  docker push "$(web_image)"
}

deploy_local() {
  minikube addons enable ingress
  docker build -t gelato-api:local -f apps/api/Dockerfile .
  docker build -t gelato-web:local -f apps/web/Dockerfile .
  minikube image load gelato-api:local
  minikube image load gelato-web:local
  kubectl apply -k k8s/overlays/local
  kubectl rollout status deployment/gelato-postgres -n "$NAMESPACE"
  kubectl rollout status deployment/gelato-api -n "$NAMESPACE"
  kubectl rollout status deployment/gelato-web -n "$NAMESPACE"
  kubectl get all -n "$NAMESPACE"
  echo "Agrega gelato.local a hosts apuntando a: $(minikube ip)"
  echo "Web:     http://gelato.local"
  echo "Swagger: http://gelato.local/api/docs"
}

repo_add() {
  if [[ -z "$SSH_PRIVATE_KEY_PATH" ]]; then echo "Debes definir SSH_PRIVATE_KEY_PATH con la llave privada SSH autorizada en GitHub." >&2; exit 1; fi
  argocd repo add "$REPO_URL" --ssh-private-key-path "$SSH_PRIVATE_KEY_PATH" --upsert
}

apply_argocd() {
  kubectl apply -f argocd/gelato-platform-app.yaml
  kubectl get application "$APP_NAME" -n "$ARGO_NAMESPACE"
}

sync_argocd() {
  argocd app sync "$APP_NAME" --grpc-web
  argocd app wait "$APP_NAME" --health --sync --timeout 300 --grpc-web
}

status_all() {
  kubectl get deploy,svc,ingress,pods -n "$NAMESPACE"
  if command -v argocd >/dev/null 2>&1; then argocd app get "$APP_NAME" --grpc-web || true; fi
}

rollback() {
  kubectl rollout undo deployment/gelato-api -n "$NAMESPACE"
  kubectl rollout undo deployment/gelato-web -n "$NAMESPACE"
  kubectl rollout status deployment/gelato-api -n "$NAMESPACE"
  kubectl rollout status deployment/gelato-web -n "$NAMESPACE"
}

case "$COMMAND" in
  help) help ;;
  build) build ;;
  push) push_images ;;
  build-push) build; push_images ;;
  deploy-local) deploy_local ;;
  repo-add) repo_add ;;
  apply-argocd) apply_argocd ;;
  sync) sync_argocd ;;
  status) status_all ;;
  rollback) rollback ;;
  *) echo "Comando inválido: $COMMAND" >&2; help; exit 1 ;;
esac
