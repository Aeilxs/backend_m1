#!/usr/bin/env pwsh

docker-compose down --volumes
docker-compose --profile dev up
