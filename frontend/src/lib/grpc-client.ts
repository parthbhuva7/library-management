/**
 * gRPC-Web client wrapper with auth metadata support.
 * Requires NEXT_PUBLIC_GRPC_BASE_URL to be set. Fails at first use if not configured.
 */

import type { Metadata } from 'grpc-web';
import { LibraryServiceClient } from '@/generated';

function get_grpc_base(): string {
  const url = process.env.NEXT_PUBLIC_GRPC_BASE_URL;
  if (url === undefined || url === null) {
    throw new Error(
      'NEXT_PUBLIC_GRPC_BASE_URL must be set. ' +
        'Add it to .env.local (e.g. NEXT_PUBLIC_GRPC_BASE_URL=http://localhost:8080)'
    );
  }
  const trimmed = String(url).trim();
  if (trimmed === '') {
    throw new Error(
      'NEXT_PUBLIC_GRPC_BASE_URL must not be empty. ' +
        'Set it in .env.local (e.g. NEXT_PUBLIC_GRPC_BASE_URL=http://localhost:8080)'
    );
  }
  return trimmed;
}

let clientInstance: LibraryServiceClient | null = null;

/**
 * Get the base URL for gRPC-Web requests.
 * Throws if NEXT_PUBLIC_GRPC_BASE_URL is not set.
 */
export function get_grpc_web_base(): string {
  return get_grpc_base();
}

/**
 * Get singleton LibraryServiceClient.
 * Throws if NEXT_PUBLIC_GRPC_BASE_URL is not set.
 */
export function get_library_client(): LibraryServiceClient {
  if (!clientInstance) {
    const host = get_grpc_base();
    const normalized = host.endsWith('/') ? host.slice(0, -1) : host;
    clientInstance = new LibraryServiceClient(normalized, null, { format: 'binary' });
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
