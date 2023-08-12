import { z } from 'zod';

export const optionsFormSchema = z.object({
  baseUrl: z.string().url('This has to be a URL'),
  username: z.string().nonempty('This cannot be empty'),
  password: z.string().nonempty('This cannot be empty'),
});

export type optionsFormValues = z.infer<typeof optionsFormSchema>;