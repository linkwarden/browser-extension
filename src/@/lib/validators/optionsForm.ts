import { z } from 'zod';

export const optionsFormSchema = z.object({
  baseUrl: z.string().url('This has to be a URL'),
  username: z.string().min(1, 'This cannot be empty'),
  password: z.string().min(1, 'This cannot be empty'),
  syncBookmarks: z.boolean().default(false).optional(),
});

export type optionsFormValues = z.infer<typeof optionsFormSchema>;