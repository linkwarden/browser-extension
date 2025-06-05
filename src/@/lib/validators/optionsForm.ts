import { z } from 'zod';

export const optionsFormSchema = z.object({
  baseUrl: z.string().url('This has to be a URL'),
  username: z.string(),
  password: z.string(),
  syncBookmarks: z.boolean().default(false),
  keepOptionsDetailsOpen: z.boolean().default(false),
  defaultCollection: z.string().optional().default('Unorganized'),
  useApiKey: z.boolean().default(false),
  apiKey: z.string().optional(),
  method: z.enum(['username', 'apiKey']).default('username'),
});

export type optionsFormValues = z.infer<typeof optionsFormSchema>;
