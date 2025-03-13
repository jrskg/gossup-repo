#!/bin/bash

# Check if services are running
services=$(sudo docker compose ps --services --status running)
required_services=("zookeeper" "kafka" "redis")

for service in "${required_services[@]}"; do
  if ! grep -qw "$service" <<< "$services"; then
    echo "Starting containers..."
    sudo docker compose up -d
    break
  fi
done

npm run server