param(
  [Parameter(Mandatory=$true)][string]$Email,
  [Parameter(Mandatory=$true)][string]$Password,
  [Parameter(Mandatory=$true)][string]$Token,
  [string]$Name = "Super Admin",
  [string]$BaseUrl = "https://aicar-demo.vercel.app"
)

$uri = "$BaseUrl/api/auth/bootstrap"
$body = @{ token = $Token; email = $Email; password = $Password; name = $Name } | ConvertTo-Json

try {
  $resp = Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $body
  Write-Host "OK: bootstrap created/updated user $($resp.email)" -ForegroundColor Green
  $resp | ConvertTo-Json -Depth 10
} catch {
  $wex = $_.Exception
  if ($wex.Response -and $wex.Response.GetResponseStream) {
    $reader = New-Object System.IO.StreamReader($wex.Response.GetResponseStream())
    $text = $reader.ReadToEnd()
    Write-Host "HTTP error: $($wex.Response.StatusCode) $($wex.Response.StatusDescription)" -ForegroundColor Yellow
    Write-Host $text
  } else {
    throw
  }
}
