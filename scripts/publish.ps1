param(
  [string]$Message = "chore: publish",
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Utf8NoBom([string]$Path, [string]$Text) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

function Invoke-GitCmd {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$GitArgs
  )

  Write-Host ("git " + ($GitArgs -join " "))
  & git @GitArgs

  if ($LASTEXITCODE -ne 0) {
    throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
  }
}

if ($Version -ne "") {
  $pkgPath = Join-Path $root "package.json"
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  $pkg.version = $Version
  $json = $pkg | ConvertTo-Json -Depth 100
  Write-Utf8NoBom $pkgPath $json

  if ($Message -eq "chore: publish") {
    $Message = "chore: publish v$Version"
  }
}

$defaultConfigRel = "src/lib/site/defaultConfig.ts"
$defaultConfigAbs = Join-Path $root $defaultConfigRel

if (Test-Path $defaultConfigAbs) {
  try {
    Invoke-GitCmd -GitArgs @("restore", "--source=HEAD", "--staged", "--worktree", "--", $defaultConfigRel)
  } catch {
    Write-Warning "Could not restore $defaultConfigRel from HEAD, continuing..."
  }

  $size = (Get-Item $defaultConfigAbs).Length
  if ($size -gt 5MB) {
    Write-Warning "$defaultConfigRel is unusually large: $size bytes"
  }
}

Invoke-GitCmd -GitArgs @("add", "-A")

try {
  Invoke-GitCmd -GitArgs @("restore", "--source=HEAD", "--staged", "--worktree", "--", $defaultConfigRel)
} catch {
  Write-Warning "Could not restore $defaultConfigRel after staging, continuing..."
}

Write-Host "Staged files:"
& git diff --cached --name-only

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "Nothing to publish (working tree clean)."
  exit 0
}

Invoke-GitCmd -GitArgs @("commit", "-m", $Message)
Invoke-GitCmd -GitArgs @("push", "origin", "main")

Write-Host "Published successfully."