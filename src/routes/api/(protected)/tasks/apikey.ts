import { db } from '$lib/db';
import { apiKeys } from '$lib/db/schemas/schema';
import { and, eq } from 'drizzle-orm';
import { createHash, timingSafeEqual } from 'node:crypto';

export async function validateApiKey(providedKey: string): Promise<{ valid: boolean; userId?: string }> {
  // Expected format: tm_<prefix>_<secret>
  const parts = providedKey.split('_');
  if (parts.length < 3 || !providedKey.startsWith('tm_')) return { valid: false };
  const prefix = parts[1];

  const sha = createHash('sha256').update(providedKey).digest('hex');

  const record = await db.query.apiKeys.findFirst({
    where: (t, { and, eq, isNull }) => and(eq(t.key_prefix, prefix), eq(t.revoked, false))
  });

  if (!record) return { valid: false };
  // Use constant-time comparison
  const match = timingSafeEqual(Buffer.from(record.key_hash, 'hex'), Buffer.from(sha, 'hex'));
  if (!match) return { valid: false };

  return { valid: true, userId: record.created_by };
}
