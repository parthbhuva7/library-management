#!/bin/bash
# Run Envoy gRPC-Web proxy for local development.
# Requires: gRPC server running on port 50051.
# Envoy listens on 8080 and forwards to the gRPC server.
set -e
cd "$(dirname "$0")/.."
if ! command -v docker &>/dev/null; then
  echo "Docker is required. Install Docker or run: docker-compose up envoy"
  exit 1
fi

docker run --rm -p 8080:8080 \
  -e ENVOY_UID=0 \
  -v "$(pwd)/envoy.yaml:/etc/envoy/envoy.yaml:ro" \
  --add-host=host.docker.internal:host-gateway \
  envoyproxy/envoy:v1.28-latest \
  -c /etc/envoy/envoy.yaml

#if using podman
# podman run --rm -p 8080:8080 \
#   -e ENVOY_UID=0 \
#   -v "$(pwd)/envoy.yaml:/etc/envoy/envoy.yaml:ro" \
#   envoyproxy/envoy:v1.28-latest \
#   -c /etc/envoy/envoy.yaml
