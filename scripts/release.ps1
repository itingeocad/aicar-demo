param(
  [Parameter(Mandatory=$true)]
  [string]$Version
)

$ErrorActionPreference = "Stop"

function Write-Utf8NoBom([string]$Path, [string]$Text) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Text, $utf8NoBom)
}

Write-Host "Releasing v$Version" -ForegroundColor Cyan

# Load package.json
$pkgPath = "package.json"
$pkgObj = Get-Content $pkgPath -Raw | ConvertFrom-Json

# Update version
$pkgObj.version = $Version

# Pin Node engine (recommended for Vercel)
if (-not $pkgObj.PSObject.Properties.Name.Contains("engines")) {
  $pkgObj | Add-Member -NotePropertyName engines -NotePropertyValue ([pscustomobject]@{ node = "20.x" }) -Force
} else {
  $pkgObj.engines.node = "20.x"
}

# Ensure auth deps exist (for demo auth/RBAC)
if (-not $pkgObj.PSObject.Properties.Name.Contains("dependencies")) {
  $pkgObj | Add-Member -NotePropertyName dependencies -NotePropertyValue ([pscustomobject]@{}) -Force
}
$pkgObj.dependencies | Add-Member -NotePropertyName bcryptjs -NotePropertyValue ("^2.4.3") -Force
$pkgObj.dependencies | Add-Member -NotePropertyName jose -NotePropertyValue ("^5.9.6") -Force

# Write back without BOM
$json = $pkgObj | ConvertTo-Json -Depth 100
Write-Utf8NoBom -Path $pkgPath -Text ($json + "`n")

git add package.json

# Commit + tag + push
$tag = "v$Version"
git commit -m "chore: release $tag"

git tag -a $tag -m $tag

git push

git push --tags

Write-Host "Done: $tag" -ForegroundColor Green
