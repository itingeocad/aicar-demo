param(
  [Parameter(Mandatory=$true)][string]$Email,
  [Parameter(Mandatory=$true)][string]$NewPassword,
  [Parameter(Mandatory=$true)][string]$Token,
  [string]$BaseUrl = "https://aicar-demo.vercel.app"
)

$body = @{
  email = $Email
  newPassword = $NewPassword
  t = $Token
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "$BaseUrl/api/auth/reset-password" `
  -ContentType "application/json" `
  -Body $body
