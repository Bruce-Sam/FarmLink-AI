# Run after: gh auth login -h github.com -p https -w
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host 'Checking GitHub CLI auth...'
gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Run this first, then approve in your browser:'
  Write-Host '  gh auth login -h github.com -p https -w'
  exit 1
}

$repoName = 'farmlink-ai'
$username = gh api user --jq .login
if (-not $username) {
  Write-Error 'Could not read GitHub username. Check gh auth login.'
}
Write-Host "Authenticated as: $username"

if (git remote get-url origin 2>$null) {
  Write-Host 'Remote origin already set.'
} else {
  gh repo create $repoName --public --source=. --remote=origin --description 'FarmLink AI — Ghana agricultural marketplace PWA'
}

git push -u origin HEAD

Write-Host ''
Write-Host "Done. Repository: https://github.com/$username/$repoName"
