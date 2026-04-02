# EngineerFlow — Deployment Guide

## Quick Reference

| Method | Best For | Time |
|---|---|---|
| [One-Click Dev](#dev-mode) | Local testing | 2 min |
| [Production Build](#production-build) | Single-server deploy | 5 min |
| [IIS (Windows)](#iis-windows) | Windows Server | 15 min |
| [Linux + Nginx](#linux--nginx) | Cloud / VPS | 20 min |
| [Docker](#docker) | Containers / Cloud | 10 min |

---

## Dev Mode

For local development and testing:

```powershell
.\start.ps1
```

Opens `http://localhost:4200` (Angular dev server) + `http://localhost:5000` (API).

Default credentials: `admin` / `admin123`

---

## Production Build

This compiles Angular into the .NET wwwroot and produces a **single deployable folder** — no Node.js needed on the server.

```powershell
.\build-prod.ps1
```

Output goes to `.\dist\`. To run it:

```powershell
cd dist
dotnet EngineerFlow.API.dll --urls=http://localhost:5000
```

Open `http://localhost:5000` — the .NET server serves both the API and the Angular app.

---

## IIS (Windows)

### Prerequisites

1. Install [.NET 8 Hosting Bundle](https://dotnet.microsoft.com/download/dotnet/8) (includes ASP.NET Core Module for IIS)
2. Enable IIS with the **ASP.NET Core Module** feature

### Steps

**1. Build the app**
```powershell
.\build-prod.ps1 -OutputDir "C:\inetpub\engineerflow"
```

**2. Create an Application Pool**

In IIS Manager:
- New Application Pool → name it `EngineerFlow`
- .NET CLR version: **No Managed Code**
- Managed pipeline: **Integrated**

Or via PowerShell:
```powershell
Import-Module WebAdministration
New-WebAppPool -Name "EngineerFlow"
Set-ItemProperty "IIS:\AppPools\EngineerFlow" managedRuntimeVersion ""
```

**3. Create the IIS Site**

```powershell
New-Website -Name "EngineerFlow" `
            -PhysicalPath "C:\inetpub\engineerflow" `
            -ApplicationPool "EngineerFlow" `
            -Port 80
```

**4. Set folder permissions**
```powershell
icacls "C:\inetpub\engineerflow" /grant "IIS AppPool\EngineerFlow:(OI)(CI)F"
```

**5. Configure environment**

Create `C:\inetpub\engineerflow\appsettings.Production.json`:
```json
{
  "JwtSettings": {
    "Secret": "CHANGE-THIS-TO-A-RANDOM-64-CHAR-STRING",
    "Issuer": "EngineerFlow",
    "Audience": "EngineerFlow",
    "ExpiryMinutes": 480
  }
}
```

**6. Start the site**
```powershell
Start-Website -Name "EngineerFlow"
```

Open `http://your-server-ip` — done.

---

## Linux + Nginx

### Prerequisites

```bash
# Ubuntu 22.04 / Debian
sudo apt update
sudo apt install -y nginx aspnetcore-runtime-8.0
```

### Steps

**1. Build on your dev machine (Windows)**
```powershell
.\build-prod.ps1 -OutputDir ".\dist"
```

**2. Copy to server**
```bash
scp -r dist/* user@your-server:/var/www/engineerflow/
```

**3. Create systemd service**

`/etc/systemd/system/engineerflow.service`:
```ini
[Unit]
Description=EngineerFlow API
After=network.target

[Service]
WorkingDirectory=/var/www/engineerflow
ExecStart=/usr/bin/dotnet /var/www/engineerflow/EngineerFlow.API.dll
Restart=always
RestartSec=5
KillSignal=SIGINT
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable engineerflow
sudo systemctl start engineerflow
```

**4. Configure Nginx**

`/etc/nginx/sites-available/engineerflow`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/engineerflow /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**5. Add SSL (free, via Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Docker

This is the simplest way to share the app as a single clickable link. One image, one container, one URL — both frontend and backend inside.

### One-command deploy

```bash
# Build and start
docker compose up -d --build

# App is now at:
# http://localhost:8080
```

That's it. The container serves the Angular app and the API from the same port.

### Share with anyone (push to Docker Hub)

```bash
# 1. Build the image
docker build -t your-dockerhub-username/engineerflow:latest .

# 2. Push it
docker push your-dockerhub-username/engineerflow:latest
```

Anyone with Docker can now run it with a single command — no Node.js, no .NET SDK needed:

```bash
docker run -d \
  -p 8080:8080 \
  -v engineerflow_data:/app/data \
  -e JwtSettings__Secret=your-secret-here \
  --name engineerflow \
  --restart unless-stopped \
  your-dockerhub-username/engineerflow:latest
```

Then open `http://localhost:8080`.

### Useful commands

```bash
# View logs
docker logs engineerflow -f

# Stop
docker compose down

# Stop and wipe data (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

### Change the port

Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:8080"   # now runs on http://localhost:3000
```

---

## Configuration Reference

All settings go in `appsettings.Production.json` (next to the `.dll`):

```json
{
  "JwtSettings": {
    "Secret": "minimum-32-character-random-secret-key-here",
    "Issuer": "EngineerFlow",
    "Audience": "EngineerFlow",
    "ExpiryMinutes": 480
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

> **Important:** Change the JWT secret before going live. Use a random 64-character string.
> Generate one: `openssl rand -base64 48`

---

## Health Checks

| Endpoint | Purpose |
|---|---|
| `GET /health` | Overall health |
| `GET /health/ready` | DB connectivity |

---

## Backup

The entire database is a single file. Back it up with:

```powershell
# Windows
Copy-Item "dist\engineerflow.db" "backups\engineerflow_$(Get-Date -f yyyyMMdd_HHmm).db"
```

```bash
# Linux
cp /var/www/engineerflow/engineerflow.db /backups/engineerflow_$(date +%Y%m%d_%H%M).db
```

Schedule daily backups with Task Scheduler (Windows) or cron (Linux).

---

## Troubleshooting

**API not starting**
```bash
# Check logs
journalctl -u engineerflow -n 50

# Check port
ss -tlnp | grep 5000
```

**502 Bad Gateway (Nginx)**
```bash
# Is the .NET process running?
systemctl status engineerflow

# Check it's listening
curl http://localhost:5000/health
```

**Database locked**
```bash
# Only one process should access the SQLite file
fuser /var/www/engineerflow/engineerflow.db
```

**Forgot admin password**
```bash
# Delete the DB — it will be recreated with seed data on next start
rm /var/www/engineerflow/engineerflow.db
systemctl restart engineerflow
```
