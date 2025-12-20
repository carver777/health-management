if (-not (Get-Command pre-commit -ErrorAction SilentlyContinue)) {
    Write-Host "Error: you should install pre-commit first:" -ForegroundColor Red
    Write-Host "  pip install pre-commit"
    Write-Host "or"
    Write-Host "  pipx install pre-commit"
    Write-Host "  uv tool install pre-commit"
    Write-Host ""
    Write-Host "then run " -NoNewline
    Write-Host "pre-commit install" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
