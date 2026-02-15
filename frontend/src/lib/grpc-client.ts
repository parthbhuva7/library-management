/**
 * gRPC-Web client wrapper with auth metadata support.
 * Uses /grpc-web path (rewritten to Envoy proxy) for all calls.
 */

import type { Metadata } from 'grpc-web';
import { LibraryServiceClient } from '@/generated';

const GRPC_WEB_BASE =
  typeof window !== 'undefined'
    ? '' // Browser: use relative path, Next.js rewrites /grpc-web
    : 'http://localhost:8080';

let clientInstance: LibraryServiceClient | null = null;

/**
 * Get the base URL for gRPC-Web requests.
 * In browser, returns empty string so requests use same origin + path.
 */
export function get_grpc_web_base(): string {
  return GRPC_WEB_BASE;
}

/**
 * Get singleton LibraryServiceClient.
 */
export function get_library_client(): LibraryServiceClient {
  if (!clientInstance) {
    const base = get_grpc_web_base();
    const host = base || '/grpc-web';
    clientInstance = new LibraryServiceClient(host, null, { format: 'binary' });
  }
  return clientInstance;
}

/**
 * Get auth metadata with Bearer token from localStorage.
 * Returns empty object if no token (for unauthenticated calls like Login).
 */
export function get_auth_metadata(): Metadata {
  if (typeof window === 'undefined') {
    return {};
  }
  const token = localStorage.getItem('token');
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}
