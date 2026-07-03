param(
  [Parameter(Position=0)]
  [ValidateSet('help','build','push','build-push','deploy-local','apply-argocd','sync','status','rollback','repo-add')]
  [string]$Command = 'help',

  [string]$Registry = 'ghcr.io',
  [string]$Owner = '94manuel',
  [string]$ApiImage = 'gelato-api',
  [string]$WebImage = 'gelato-web',
  [string]$Tag = 'local',
  [string]$Namespace = 'gelato',
  [string]$ArgoNamespace = 'argocd',
  [string]$AppName = 'gelato-recipes-platform',
  [string]$RepoUrl = 'git@github.com:94manuel/gelato.git',
  [string]$SshPrivateKeyPath = ''
)

$ErrorActionPreference = 'Stop'

function Show-Help {
  Write-Host ''
  Write-Host 'Gelato deployment CLI'
  Write-Host ''
  Write-Host 'Comandos:'
  Write-Host '  help          Muestra esta ayuda'
  Write-Host '  build         Construye imágenes Docker api/web'
  Write-Host '  push          Publica imágenes api/web en GHCR'
  Write-Host '  build-push    Construye y publica imágenes'
  Write-Host '  deploy-local  Despliega en Minikube con imágenes locales y kustomize overlay local'
  Write-Host '  repo-add      Registra el repo SSH en ArgoCD usando una llave privada'
  Write-Host '  apply-argocd  Aplica la Application de ArgoCD'
  Write-Host '  sync          Fuerza sincronización de ArgoCD'
  Write-Host '  status        Muestra estado Kubernetes y ArgoCD si está disponible'
  Write-Host '  rollback      Hace rollback de deploy/api y deploy/web al revision anterior de Kubernetes'
  Write-Host ''
  Write-Host 'Ejemplos:'
  Write-Host '  .\scripts\gelato-deploy.ps1 deploy-local'
  Write-Host '  .\scripts\gelato-deploy.ps1 build-push -Tag sha-abc1234'
  Write-Host '  .\scripts\gelato-deploy.ps1 repo-add -SshPrivateKeyPath C:\Users\manuel\.ssh\argocd_gelato'
  Write-Host '  .\scripts\gelato-deploy.ps1 apply-argocd'
  Write-Host '  .\scripts\gelato-deploy.ps1 sync'
}

function Image-Api { if ($Tag -eq 'local') { return 'gelato-api:local' } return "$Registry/$Owner/$ApiImage`:$Tag" }
function Image-Web { if ($Tag -eq 'local') { return 'gelato-web:local' } return "$Registry/$Owner/$WebImage`:$Tag" }

function Build-Images {
  Write-Host "Building API image: $(Image-Api)"
  docker build -t $(Image-Api) -f apps/api/Dockerfile .
  Write-Host "Building Web image: $(Image-Web)"
  docker build -t $(Image-Web) -f apps/web/Dockerfile .
}

function Push-Images {
  if ($Tag -eq 'local') { throw 'Para push usa -Tag sha-xxxx o -Tag main; local no se publica.' }
  Write-Host "Pushing API image: $(Image-Api)"
  docker push $(Image-Api)
  Write-Host "Pushing Web image: $(Image-Web)"
  docker push $(Image-Web)
}

function Deploy-Local {
  minikube addons enable ingress
  docker build -t gelato-api:local -f apps/api/Dockerfile .
  docker build -t gelato-web:local -f apps/web/Dockerfile .
  minikube image load gelato-api:local
  minikube image load gelato-web:local
  kubectl apply -k k8s/overlays/local
  kubectl rollout status deployment/gelato-postgres -n $Namespace
  kubectl rollout status deployment/gelato-api -n $Namespace
  kubectl rollout status deployment/gelato-web -n $Namespace
  kubectl get all -n $Namespace
  Write-Host "IP Minikube: $(minikube ip)"
  Write-Host 'Agrega esa IP en hosts apuntando a gelato.local'
  Write-Host 'Web:     http://gelato.local'
  Write-Host 'Swagger: http://gelato.local/api/docs'
}

function Repo-Add {
  if ([string]::IsNullOrWhiteSpace($SshPrivateKeyPath)) {
    throw 'Debes pasar -SshPrivateKeyPath con la ruta de la llave privada SSH autorizada en GitHub.'
  }
  argocd repo add $RepoUrl --ssh-private-key-path $SshPrivateKeyPath --upsert
}

function Apply-ArgoCD {
  kubectl apply -f argocd/gelato-platform-app.yaml
  kubectl get application $AppName -n $ArgoNamespace
}

function Sync-ArgoCD {
  argocd app sync $AppName --grpc-web
  argocd app wait $AppName --health --sync --timeout 300 --grpc-web
}

function Status-All {
  kubectl get deploy,svc,ingress,pods -n $Namespace
  if (Get-Command argocd -ErrorAction SilentlyContinue) {
    argocd app get $AppName --grpc-web
  }
}

function Rollback-K8s {
  kubectl rollout undo deployment/gelato-api -n $Namespace
  kubectl rollout undo deployment/gelato-web -n $Namespace
  kubectl rollout status deployment/gelato-api -n $Namespace
  kubectl rollout status deployment/gelato-web -n $Namespace
}

switch ($Command) {
  'help' { Show-Help }
  'build' { Build-Images }
  'push' { Push-Images }
  'build-push' { Build-Images; Push-Images }
  'deploy-local' { Deploy-Local }
  'repo-add' { Repo-Add }
  'apply-argocd' { Apply-ArgoCD }
  'sync' { Sync-ArgoCD }
  'status' { Status-All }
  'rollback' { Rollback-K8s }
}
