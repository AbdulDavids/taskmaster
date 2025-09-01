import z from 'zod';

export const CreateApiKeyRequest = z.object({
  label: z.string().min(1, 'Label is required').max(255, 'Label must be 255 characters or less')
});

export type CreateApiKeyRequest = z.infer<typeof CreateApiKeyRequest>;
