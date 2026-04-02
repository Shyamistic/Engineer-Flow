# ============================================================
# EngineerFlow — Production Build Script
# Builds Angular into the .NET wwwroot, then publishes a
# single self-contained deployable folder: ./dist/
# ============================================================

param(
    [string]$OutputDir = ".\dist",
    [string]$ApiUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Stop"
$StartTime = Get-Date

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   EngineerFlow — Production Build        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Prerequisites ──────────────────────────────────────────
function Require($cmd, $hint) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "✗ $cmd not found. $hint" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ $cmd found" -ForegroundColor Green
}

Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Require "dotnet" "Install .NET SDK from https://dotnet.microsoft.com/download"
Require "node"   "Install Node.js from https://nodejs.org"
Require "npm"    "Install Node.js from https://nodejs.org"

# ── Step 1: Build Angular ──────────────────────────────────
Write-Host ""
Write-Host "Step 1/3 — Building Angular (production)..." -ForegroundColor Yellow

$frontendDir = ".\frontend\engineerflow-ui"
Push-Location $frontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing npm dependencies..." -ForegroundColor Gray
    npm ci --silent
    if ($LASTEXITCODE -ne 0) { Write-Host "npm ci failed" -ForegroundColor Red; exit 1 }
}

# Build with production config
npx ng build --configuration production --output-path "../../backend/EngineerFlow.API/wwwroot" --base-href "/"
if ($LASTEXITCODE -ne 0) { Write-Host "Angular build failed" -ForegroundColor Red; exit 1 }

Pop-Location
Write-Host "  ✓ Angular build complete" -ForegroundColor Green

# ── Step 2: Add SPA fallback web.config ───────────────────
Write-Host ""
Write-Host "Step 2/3 — Writing web.config for SPA routing..." -ForegroundColor Yellow

$webConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/hubs" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/health" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/scalar" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
  </system.webServer>
</configuration>
'@

$webConfig | Out-File -FilePath ".\backend\EngineerFlow.API\wwwroot\web.config" -Encoding UTF8
Write-Host "  ✓ web.config written" -ForegroundColor Green

# ── Step 3: Publish .NET API ───────────────────────────────
Write-Host ""
Write-Host "Step 3/3 — Publishing .NET API (self-contained)..." -ForegroundColor Yellow

Push-Location ".\backend\EngineerFlow.API"

dotnet publish -c Release -o "$OutputDir" --nologo -p:PublishSingleFile=false
if ($LASTEXITCODE -ne 0) { Write-Host "dotnet publish failed" -ForegroundColor Red; exit 1 }

Pop-Location
Write-Host "  ✓ .NET publish complete" -ForegroundColor Green

# ── Done ───────────────────────────────────────────────────
$elapsed = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 1)

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Build Complete in ${elapsed}s               ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Output: $OutputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the production build:" -ForegroundColor White
Write-Host "  cd $OutputDir" -ForegroundColor Gray
Write-Host "  dotnet EngineerFlow.API.dll --urls=http://localhost:5000" -ForegroundColor Gray
Write-Host ""
Write-Host "Then open: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
