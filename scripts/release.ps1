param(
  [Parameter(Mandatory=$true)]
  [string]$Version,

  # Optional: skip tagging
  [switch]$NoTag
)

$ErrorActionPreference = "Stop"

function Write-Utf8NoBom([string]$Path, [string]$Text) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $abs = (Resolve-Path $Path).Path
  [System.IO.File]::WriteAllText($abs, $Text, $utf8NoBom)
}

Write-Host "Releasing v$Version" -ForegroundColor Cyan

$pkgPath = "package.json"
$pkgObj = Get-Content $pkgPath -Raw | ConvertFrom-Json

# Update version
$pkgObj.version = $Version

# Pin Node engine for Vercel (keeps builds stable)
if (-not $pkgObj.PSObject.Properties.Name.Contains("engines")) {
  $pkgObj | Add-Member -NotePropertyName engines -NotePropertyValue ([pscustomobject]@{ node = "20.x" }) -Force
} else {
  if (-not $pkgObj.engines) { $pkgObj.engines = [pscustomobject]@{} }
  $pkgObj.engines.node = "20.x"
}

# Write package.json WITHOUT BOM (prevents "Unexpected token '﻿'" on Vercel)
$json = ($pkgObj | ConvertTo-Json -Depth 100)
Write-Utf8NoBom -Path $pkgPath -Text ($json + "`n")

git add package.json

$tag = "v$Version"

# Commit
$commitMsg = "chore: release $tag"
git commit -m $commitMsg

if (-not $NoTag) {
  git tag -a $tag -m $tag
}

git push

if (-not $NoTag) {
  git push --tags
}

Write-Host "Done: $tag" -ForegroundColor Green
