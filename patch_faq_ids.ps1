param(
  [string]$Target = "src/lib/site/defaultConfig.ts",
  [string]$Prefix = "faq"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $Target)) {
  Write-Error "Target file not found: $Target"
  exit 1
}

# Read as UTF-8 (with/without BOM) safely
$bytes = [System.IO.File]::ReadAllBytes($Target)
# Detect BOM
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
  $bytes = $bytes[3..($bytes.Length-1)]
}
$txt = [System.Text.Encoding]::UTF8.GetString($bytes)

# Preserve line endings
$eol = "\n"
if ($txt.Contains("`r`n")) { $eol = "`r`n" }

# Backup
$ts = (Get-Date).ToString("yyyyMMdd_HHmmss")
$bak = "$Target.bak.$ts"
Copy-Item -LiteralPath $Target -Destination $bak -Force

# Add id to objects that start with q: as the first property: {\n  q: ...
$counter = 1
$rx = [regex]::new("\{\s*(?:" + [regex]::Escape($eol) + ")\s*(?<indent>\s*)q\s*:", [System.Text.RegularExpressions.RegexOptions]::Multiline)

$patched = $rx.Replace($txt, {
  param($m)
  $indent = $m.Groups["indent"].Value
  $id = "${Prefix}$counter"
  $counter++
  "{" + $eol + $indent + "id: '" + $id + "'," + $eol + $indent + "q:"
})

$changed = ($patched -ne $txt)
if (-not $changed) {
  Write-Warning "No patterns were patched. Either IDs already exist, or formatting differs. Restore from $bak if needed."
  exit 2
}

# Write UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($Target, $patched, $utf8NoBom)

Write-Host "Patched $Target. Added IDs to $($counter-1) FAQ items. Backup: $bak" -ForegroundColor Green
