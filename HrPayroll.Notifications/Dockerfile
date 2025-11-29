FROM mcr.microsoft.com/dotnet/runtime:8.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["HrPayroll.Notifications/HrPayroll.Notifications.csproj", "HrPayroll.Notifications/"]
RUN dotnet restore "HrPayroll.Notifications/HrPayroll.Notifications.csproj"
COPY . .
WORKDIR "/src/HrPayroll.Notifications"
RUN dotnet build "./HrPayroll.Notifications.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./HrPayroll.Notifications.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HrPayroll.Notifications.dll"]
