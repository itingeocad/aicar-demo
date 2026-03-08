param(
  [Parameter(Mandatory=$false)][string]$Email,
  [Parameter(Mandatory=$true)][string]$NewPassword,
  [Parameter(Mandatory=$true)][string]$Token,
  [switch]$SuperAdmin,
  [string]$BaseUrl = "https://aicar-demo.vercel.app"
)

$body = @{
  newPassword = $NewPassword
  t = $Token
}

if ($SuperAdmin) {
  $body.superAdmin = $true
}

if ($Email -and $Email.Trim().Length -gt 0) {
  $body.email = $Email
}

$json = $body | ConvertTo-Json

try {
  Invoke-RestMethod -Method Post `
    -Uri "$BaseUrl/api/auth/reset-password" `
    -ContentType "application/json" `
    -Body $json
} catch {
  # Print response body if server returned one (helps disambiguate 404 route vs 404 user)
  if ($_.Exception -and $_.Exception.Response) {
    $resp = $_.Exception.Response
    try {
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $text = $reader.ReadToEnd()
      Write-Host "HTTP error:" $resp.StatusCode $resp.StatusDescription
      Write-Host $text
      exit 1
    } catch {}
  }
  throw
}
