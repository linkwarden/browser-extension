import { z } from 'zod';

export const optionsFormSchema = z.object({
  baseUrl: z.string().url('This has to be a URL'),
  username: z.string().optional(),
  password: z.string().optional(),
  syncBookmarks: z.boolean().default(false),
  usingSSO: z.boolean().default(false),
  apiKey: z.string().startsWith('eyJ', 'This has to be an API key'),
  defaultCollection: z.string().optional().default('Unorganized'),
  defaultExpanded: z.boolean().default(false)
});

export type optionsFormValues = z.infer<typeof optionsFormSchema>;
