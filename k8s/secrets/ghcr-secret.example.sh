#!/usr/bin/env bash
set -euo pipefail
kubectl create secret docker-registry ghcr-secret \
  -n gelato \
  --docker-server=ghcr.io \
  --docker-username=94manuel \
  --docker-password="${GITHUB_PACKAGE_TOKEN}" \
  --docker-email="tu-correo@dominio.com" \
  --dry-run=client -o yaml | kubectl apply -f -
