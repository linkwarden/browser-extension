import { z } from 'zod';

export const bookmarkFormSchema = z.object({
  address: z.string().url('This has to be a URL'),
  collection: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
  description: z.string(),
});

export type bookmarkFormValues = z.infer<typeof bookmarkFormSchema>