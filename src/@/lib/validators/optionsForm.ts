import { z } from 'zod';

export const optionsFormSchema = z.object({
  baseUrl: z.string().url('This has to be a URL'),
  apiToken: z.string().nonempty('You must provide an API token.'),
});

export type optionsFormValues = z.infer<typeof optionsFormSchema>;