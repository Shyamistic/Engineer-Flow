# EngineerFlow — Windows startup script
Write-Host "Starting EngineerFlow..." -ForegroundColor Cyan

# Ensure dotnet global tools are on PATH
$env:PATH += ";$env:USERPROFILE\.dotnet\tools"

# Check prerequisites
function Check-Tool($cmd, $msg) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "$msg Download from the official site." -ForegroundColor Red
        return $false
    }
    return $true
}

if (-not (Check-Tool "dotnet" ".NET SDK Not Found.")) { exit 1 }
if (-not (Check-Tool "node" "Node.js Not Found.")) { exit 1 }

# Check for dotnet-ef
if (-not (Get-Command dotnet-ef -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Entity Framework Core Tools..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef --version 8.0.0
}

Write-Host "--- Backend Setup ---" -ForegroundColor Cyan
Set-Location backend/EngineerFlow.API
dotnet restore

# Check for Migrations
if (-not (Test-Path "Migrations")) {
    Write-Host "Generating initial migrations..." -ForegroundColor Yellow
    dotnet-ef migrations add InitialCreate
}

Write-Host "Updating database..." -ForegroundColor Yellow
dotnet-ef database update

Write-Host "Starting API server on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; dotnet run --urls=http://localhost:5000"

Write-Host "--- Frontend Setup ---" -ForegroundColor Cyan
Set-Location ../../frontend/engineerflow-ui
if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Angular dev server on http://localhost:4200..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ng serve --open"

Write-Host "--- Setup Complete! ---" -ForegroundColor Green
Write-Host "App: http://localhost:4200"
Write-Host "API: http://localhost:5000"
Write-Host "Docs: http://localhost:5000/scalar/v1"