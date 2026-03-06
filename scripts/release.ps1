param(
  [Parameter(Mandatory=$true)]
  [string]$Version
)

$ErrorActionPreference = "Stop"

Write-Host "Releasing version $Version..." -ForegroundColor Cyan

# Update package.json version in-place
(Get-Content .\package.json -Raw) `
  -replace '("version"\s*:\s*")[^"]+(")', "`$1$Version`$2" `
  | Set-Content .\package.json -Encoding utf8

git add package.json
git commit -m "chore: release v$Version"
git tag -a "v$Version" -m "v$Version"
git push
git push --tags

Write-Host "Done. Pushed commit + tag v$Version." -ForegroundColor Green