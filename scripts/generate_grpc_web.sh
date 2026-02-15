#!/bin/bash
# Generate TypeScript gRPC-Web client from proto files.
# Requires: protoc, protoc-gen-js, protoc-gen-grpc-web (via npm).
set -e
cd "$(dirname "$0")/.."
OUT_DIR="frontend/src/generated"
mkdir -p "$OUT_DIR"
PLUGIN_PATH="$(pwd)/frontend/node_modules/.bin"
export PATH="$PLUGIN_PATH:$PATH"
PROTOC=""
if command -v protoc &>/dev/null; then
  PROTOC=protoc
elif [ -f ".venv/bin/activate" ] && . .venv/bin/activate 2>/dev/null && python -c "import grpc_tools" 2>/dev/null; then
  PROTOC="python -m grpc_tools.protoc"
else
  echo "protoc is required. Install: brew install protobuf, or use Python venv with grpcio-tools"
  exit 1
fi
$PROTOC -I=. \
  --js_out=import_style=commonjs,binary:"$OUT_DIR" \
  --grpc-web_out=import_style=typescript,mode=grpcweb:"$OUT_DIR" \
  proto/library.proto \
  proto/auth.proto \
  proto/library_service.proto
echo "Generated gRPC-Web client in $OUT_DIR"
