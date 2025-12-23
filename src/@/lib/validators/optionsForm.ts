import { z } from 'zod';

export const optionsFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  baseUrl: z.string().url('This has to be a URL'),
  username: z.string(),
  password: z.string(),
  syncBookmarks: z.boolean(),
  defaultCollection: z.string(),
  apiKey: z.string().optional(),
  method: z.enum(['username', 'apiKey']),
}).superRefine((data, ctx) => {
  // Validate based on authentication method
  if (data.method === 'apiKey') {
    if (!data.apiKey || data.apiKey.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'API Key is required when using API Key method',
        path: ['apiKey'],
      });
    }
  } else if (data.method === 'username') {
    if (!data.username || data.username.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Username is required',
        path: ['username'],
      });
    }
    if (!data.password || data.password.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required',
        path: ['password'],
      });
    }
  }
});

export type optionsFormValues = z.infer<typeof optionsFormSchema>;
