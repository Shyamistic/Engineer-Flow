# EngineerFlow — Windows startup script
Write-Host "🚀 Starting EngineerFlow..." -ForegroundColor Cyan

# Check prerequisites
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Host "❌ .NET SDK not found. Download from https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Download from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Restoring backend..." -ForegroundColor Yellow
Set-Location backend/EngineerFlow.API
dotnet restore

# Generate migrations if not exist
if (-not (Test-Path "Migrations")) {
    Write-Host "🗃️ Generating initial migration..." -ForegroundColor Yellow
    dotnet ef migrations add InitialCreate
}

Write-Host "🗃️ Updating database..." -ForegroundColor Yellow
dotnet ef database update

Write-Host "🌐 Starting API server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; dotnet run --urls=http://localhost:5000"

Set-Location ../../frontend/engineerflow-ui
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🎨 Starting Angular dev server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ng serve --open"

Write-Host "✅ EngineerFlow is starting!" -ForegroundColor Green
Write-Host "   API: http://localhost:5000" -ForegroundColor White
Write-Host "   App: http://localhost:4200" -ForegroundColor White
Write-Host "   Swagger: http://localhost:5000/swagger" -ForegroundColor White