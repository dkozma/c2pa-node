import { createHash } from 'node:crypto';
import type { Asset } from '../bindings';
import type { ResourceRef } from '../types';

type Algorithm = 'sha256' | 'sha384' | 'sha512';

const DEFAULT_ALG: Algorithm = 'sha256';

/**
 * Calculates the SHA of a buffer as base64
 */
export async function sha(data: Buffer, algorithm: Algorithm = DEFAULT_ALG) {
  const hash = createHash(algorithm);
  hash.update(data);

  return hash.digest('base64');
}

export async function labeledSha(
  asset: Asset,
  algorithm: Algorithm = DEFAULT_ALG,
) {
  const hash = await sha(asset.buffer, algorithm);
  const suffix = asset.mimeType.split('/')[1] ?? 'bin';
  return `${algorithm}-${hash}.${suffix}`;
}

export async function getResourceReference(
  asset: Asset,
  instanceId: string | null,
  algorithm: Algorithm = DEFAULT_ALG,
): Promise<ResourceRef> {
  const suffix = asset.mimeType.split('/')[1] ?? 'bin';
  const identifier = instanceId
    ? `${instanceId.replace(/[^a-z0-9\-]+/gi, '-')}.${suffix}`
    : await labeledSha(asset, algorithm);

  return {
    format: asset.mimeType,
    identifier,
  };
}
