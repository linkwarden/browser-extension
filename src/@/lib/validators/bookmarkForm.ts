import { z } from 'zod';

export const bookmarkFormSchema = z.object({
  url: z.string().url('This has to be a URL'),
  collection: z.object({
    name: z.string(),
  }),
  tags: z.array(z.string()).nullish(),
  name: z.string(),
  description: z.string(),
});

export type bookmarkFormValues = z.infer<typeof bookmarkFormSchema>