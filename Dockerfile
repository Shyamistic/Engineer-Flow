# ─────────────────────────────────────────────────────────────
# Stage 1: Build Angular frontend
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Install deps first (layer cache)
COPY frontend/engineerflow-ui/package*.json ./
RUN npm ci --silent

# Copy source and build for production
COPY frontend/engineerflow-ui/ ./
RUN npx ng build --configuration production --output-path /angular-dist --base-href / --no-progress

# ─────────────────────────────────────────────────────────────
# Stage 2: Build .NET backend
# ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /src

# Restore packages first (layer cache)
COPY backend/EngineerFlow.API/EngineerFlow.API.csproj ./
RUN dotnet restore

# Copy source and publish
COPY backend/EngineerFlow.API/ ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# ─────────────────────────────────────────────────────────────
# Stage 3: Final runtime image
# ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Copy published .NET app
COPY --from=backend-build /app/publish ./

# Copy Angular build into wwwroot (served as static files)
# In Angular 18, assets are nested in a /browser subfolder
COPY --from=frontend-build /angular-dist/browser ./wwwroot

# Persistent volume for SQLite database
VOLUME ["/app/data"]

# Override DB path to use the volume
ENV DB_PATH=/app/data/engineerflow.db
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "EngineerFlow.API.dll"]
