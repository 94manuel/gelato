$ErrorActionPreference = "Stop"

# Compatibilidad: este script delega en el CLI nuevo.
# Web y API quedan en Deployments/pods separados.
.\scripts\gelato-deploy.ps1 deploy-local
