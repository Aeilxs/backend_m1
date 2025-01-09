#!/bin/bash

docker compose down --volumes
docker compose --profile dev up
