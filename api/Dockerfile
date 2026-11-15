# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:11.0 AS build
WORKDIR /src

# Copy .csproj first and restore packages
COPY AeroVault.API.csproj ./
RUN dotnet restore

# Copy the rest of the API source code and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Lightweight Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:11.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "AeroVault.API.dll"]