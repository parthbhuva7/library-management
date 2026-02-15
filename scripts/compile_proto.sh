#!/bin/bash
# Compile Protocol Buffer definitions to Python gRPC code.
set -e
cd "$(dirname "$0")/.."
mkdir -p src/generated
python3 -m grpc_tools.protoc \
  -I. \
  --python_out=src/generated \
  --grpc_python_out=src/generated \
  proto/library.proto \
  proto/auth.proto \
  proto/library_service.proto
