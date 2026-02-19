import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('grpc-client', () => {
  const originalEnv = process.env.NEXT_PUBLIC_GRPC_BASE_URL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GRPC_BASE_URL = originalEnv;
  });

  it('throws when NEXT_PUBLIC_GRPC_BASE_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_GRPC_BASE_URL;
    const { get_grpc_web_base } = await import('../grpc-client');
    expect(() => get_grpc_web_base()).toThrow(
      /NEXT_PUBLIC_GRPC_BASE_URL must be set/
    );
  });

  it('throws when NEXT_PUBLIC_GRPC_BASE_URL is empty string', async () => {
    process.env.NEXT_PUBLIC_GRPC_BASE_URL = '';
    const { get_grpc_web_base } = await import('../grpc-client');
    expect(() => get_grpc_web_base()).toThrow(
      /NEXT_PUBLIC_GRPC_BASE_URL must not be empty/
    );
  });

  it('throws when NEXT_PUBLIC_GRPC_BASE_URL is whitespace only', async () => {
    process.env.NEXT_PUBLIC_GRPC_BASE_URL = '   ';
    const { get_grpc_web_base } = await import('../grpc-client');
    expect(() => get_grpc_web_base()).toThrow(
      /NEXT_PUBLIC_GRPC_BASE_URL must not be empty/
    );
  });

  it('returns URL when NEXT_PUBLIC_GRPC_BASE_URL is set', async () => {
    process.env.NEXT_PUBLIC_GRPC_BASE_URL = 'http://localhost:8080';
    const { get_grpc_web_base } = await import('../grpc-client');
    expect(get_grpc_web_base()).toBe('http://localhost:8080');
  });

  it('trims trailing slash from URL', async () => {
    process.env.NEXT_PUBLIC_GRPC_BASE_URL = 'http://localhost:8080/';
    const { get_library_client } = await import('../grpc-client');
    const client = get_library_client();
    expect(client).toBeDefined();
  });
});
