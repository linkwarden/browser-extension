import { z } from 'zod';

export const configSchema = z.object({
  baseUrl: z.string().url(),
  defaultCollection: z.string().optional().default('Unorganized'),
  apiKey: z.string(),
  syncBookmarks: z.boolean().optional().default(false),
  theme: z.enum(['light', 'dark', 'system']).optional().default('system'),
  method: z.enum(['username', 'apiKey']).optional().default('username'),
  cacheRefreshInterval: z.number().min(15).max(600).optional().default(60), // 15 seconds to 10 minutes
});

export type configType = z.infer<typeof configSchema>;
