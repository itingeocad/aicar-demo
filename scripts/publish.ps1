param(
  [string]$Message = "chore: publish",
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"

# Go to repo root (scripts/ is inside repo)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Utf8NoBom([string]$Path, [string]$Text) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

if ($Version -ne "") {
  # Update package.json version safely (no BOM)
  $pkgPath = Join-Path $root "package.json"
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  $pkg.version = $Version
  $json = $pkg | ConvertTo-Json -Depth 100
  Write-Utf8NoBom $pkgPath $json

  # Also update default site config version (for fresh installs)
  $dcPath = Join-Path $root "src\lib\site\defaultConfig.ts"
  if (Test-Path $dcPath) {
    $dc = Get-Content $dcPath -Raw
    $dc = $dc -replace "version:\s*'[^']+'", ("version: '" + $Version + "'")
    Write-Utf8NoBom $dcPath $dc
  }

  if ($Message -eq "chore: publish") {
    $Message = "chore: publish v$Version"
  }
}

git add -A

# If nothing to commit, exit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "Nothing to publish (working tree clean)."
  exit 0
}

git commit -m $Message
git push

Write-Host "Published successfully."
