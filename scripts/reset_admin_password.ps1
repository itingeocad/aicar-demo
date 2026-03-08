param(
  [Parameter(Mandatory=$false)]
  [string]$Email,

  [Parameter(Mandatory=$true)]
  [string]$NewPassword,

  [Parameter(Mandatory=$true)]
  [string]$Token,

  [Parameter(Mandatory=$false)]
  [switch]$SuperAdmin
)

$uri = "https://aicar-demo.vercel.app/api/auth/reset-password"

$payload = @{
  t = $Token
  newPassword = $NewPassword
}

if ($SuperAdmin) {
  $payload.superAdmin = $true
} elseif ($Email) {
  $payload.email = $Email
}

$body = $payload | ConvertTo-Json

try {
  Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $body
} catch {
  $resp = $_.Exception.Response
  if ($resp -and $resp.GetResponseStream()) {
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $text = $reader.ReadToEnd()
    Write-Host "HTTP error:" $resp.StatusCode $resp.StatusDescription
    Write-Host $text
  } else {
    throw
  }
}
