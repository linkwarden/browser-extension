import { z } from 'zod';

export const optionsFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  baseUrl: z.string().url('This has to be a URL'),
  username: z.string(),
  password: z.string(),
  syncBookmarks: z.boolean(),
  defaultCollection: z.string(),
  useApiKey: z.boolean(),
  apiKey: z.string().optional(),
  method: z.enum(['username', 'apiKey']),
});

export type optionsFormValues = z.infer<typeof optionsFormSchema>;
