$ErrorActionPreference = "Continue"
$output = dotnet build backend/AuthService/AuthService.csproj 2>&1
$output | Out-File -FilePath "build_errors.log" -Encoding UTF8
Write-Host "=== BUILD OUTPUT ==="
$output
Write-Host "`n=== ERROR DETAILS ==="
$output | Where-Object { $_ -match "error" }
