#!/usr/bin/env bash

set -e  # Exit on any error

# Change to correct directory
cd ~/bo-ui

# Note: .env file is used by docker-compose directly
if [ -f .env ]; then
    echo "Found .env file for docker-compose"
else
    echo "Warning: .env file not found"
fi

# Create network if it doesn't exist
docker network create sbenet || true

# Stop existing containers
docker compose down || true

# Pull latest images
docker compose pull

# Start services
docker compose up -d

# Show running containers
docker ps

echo "Deployment completed successfully"

     