import { z } from 'zod';

export const configSchema = z.object({
  baseUrl: z.string().url(),
  defaultCollection: z.string().optional().default('Unorganized'),
  apiKey: z.string(),
  syncBookmarks: z.boolean().optional().default(false),
  theme: z.enum(['light', 'dark', 'system']).optional().default('system'),
  method: z.enum(['username', 'apiKey']).optional().default('username'),
});

export type configType = z.infer<typeof configSchema>;
