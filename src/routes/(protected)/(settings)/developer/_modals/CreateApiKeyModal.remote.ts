import { command, getRequestEvent } from '$app/server';
import { apiKeys } from '$lib/db/schemas/schema';
import { randomBytes, createHash } from 'node:crypto';
import { CreateApiKeyRequest } from './CreateApiKeyModal.schemas';

function generateApiKey(): { key: string; prefix: string; hash: string } {
  const prefix = randomBytes(4).toString('hex'); // 8 chars
  const secret = randomBytes(24).toString('base64url');
  const key = `tm_${prefix}_${secret}`;
  const hash = createHash('sha256').update(key).digest('hex');
  return { key, prefix, hash };
}

export const createApiKey = command(CreateApiKeyRequest, async (request) => {
  const { locals } = getRequestEvent();
  const { user } = await locals.validateSession();

  const { key, prefix, hash } = generateApiKey();

  await locals.db
    .insert(apiKeys)
    .values({
      label: request.label,
      key_prefix: prefix,
      key_hash: hash,
      created_by: user.id
    })
    .returning();

  return { key };
});
