#!/usr/bin/env bash
set -euo pipefail

# Compatibilidad: este script delega en el CLI nuevo.
# Web y API quedan en Deployments/pods separados.
./scripts/gelato-deploy.sh deploy-local
