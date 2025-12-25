$secretsPath = "frontend/postman/secrets.json"
$envPath = "frontend/postman/local.postman_environment.json"
$tempPath = "frontend/postman/temp.json"

# Check if secrets file exists
if (-not (Test-Path $secretsPath)) {
    Write-Error "Secrets file not found at $secretsPath"
    exit 1
}

# Read baseUrl using jq
$baseUrl = Get-Content $secretsPath | jq -r '.baseUrl'

if (-not $baseUrl) {
    Write-Error "Could not extract baseUrl from secrets file"
    exit 1
}

Write-Host "Updating baseUrl to $baseUrl..."

# Update the environment file using jq
# We use --arg to pass the variable safely to jq
jq --arg url "$baseUrl" '(.values[] | select(.key == "baseUrl")).value = $url' $envPath > $tempPath

if ($LASTEXITCODE -eq 0) {
    Move-Item -Force $tempPath $envPath
    Write-Host "Successfully updated Postman environment."
} else {
    Write-Error "Failed to update Postman environment."
    Remove-Item -Force $tempPath -ErrorAction SilentlyContinue
    exit 1
}
