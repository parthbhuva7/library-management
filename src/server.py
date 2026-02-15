"""
gRPC server for Library Management.
"""
import logging
import signal
import sys
from pathlib import Path

import grpc
from concurrent import futures

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent / "generated"))

from config import SERVER_PORT
from app.library.grpc_handlers import LibraryServiceHandler
from proto import library_service_pb2_grpc

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

server = None


def serve():
    """Start the gRPC server."""
    global server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    library_service_pb2_grpc.add_LibraryServiceServicer_to_server(
        LibraryServiceHandler(),
        server
    )
    server.add_insecure_port(f"[::]:{SERVER_PORT}")
    server.start()
    logger.info("gRPC server started on port %s", SERVER_PORT)

    def shutdown(signum, frame):
        logger.info("Shutting down server...")
        if server:
            server.stop(0)
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
