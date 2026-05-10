$inputJson = [System.Console]::In.ReadToEnd()
$portFile = Join-Path $env:USERPROFILE ".petdex-cc\data\port.lock"
$port = 17321
if (Test-Path $portFile) {
    $port = Get-Content $portFile -ErrorAction SilentlyContinue
    if (-not $port) { $port = 17321 }
}
$url = "http://localhost:$port/event"
try {
    Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $inputJson -UseBasicParsing -TimeoutSec 5 | Out-Null
} catch {}
