/**
 * Centralized gRPC-Web error handling.
 * Converts gRPC errors to user-friendly messages.
 */

import type { RpcError } from 'grpc-web';

const UNAUTHENTICATED = 16;
const UNAVAILABLE = 14;
const DEADLINE_EXCEEDED = 4;
const FAILED_PRECONDITION = 9;
const NOT_FOUND = 5;

/**
 * Convert gRPC error to user-friendly message.
 */
export function handle_grpc_error(err: unknown): string {
  if (!err || typeof err !== 'object') {
    return 'An unexpected error occurred';
  }
  const rpc = err as RpcError;
  if (typeof rpc.code === 'number') {
    switch (rpc.code) {
      case UNAUTHENTICATED:
        return 'Invalid credentials';
      case UNAVAILABLE:
        return 'Service unavailable. Please try again later.';
      case DEADLINE_EXCEEDED:
        return 'Request timed out. Please try again.';
      case FAILED_PRECONDITION:
        return rpc.message || 'Operation not allowed (e.g., copy already borrowed)';
      case NOT_FOUND:
        return rpc.message || 'Resource not found';
      default:
        return rpc.message || 'An error occurred';
    }
  }
  if (err instanceof Error) {
    if (err.message?.includes('fetch') || err.message?.includes('network')) {
      return 'Service unavailable. Please check your connection.';
    }
    return err.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if error indicates auth expired (should redirect to login).
 */
export function is_auth_error(err: unknown): boolean {
  const rpc = err as RpcError;
  return typeof rpc?.code === 'number' && rpc.code === UNAUTHENTICATED;
}
