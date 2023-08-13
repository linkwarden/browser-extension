import { useForm } from 'react-hook-form';
import { bookmarkFormSchema, bookmarkFormValues } from '../lib/validators/bookmarkForm.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/Form.tsx';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';
import { Separator } from './ui/Separator.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select.tsx';
import { TagInput } from './TagInput.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { getCurrentTabInfo } from '../lib/utils.ts';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getCsrfToken, getSession, performLoginOrLogout } from '../lib/auth/auth.ts';
import { getConfig } from '../lib/config.ts';
import { postLink } from '../lib/actions/links.ts';
import { AxiosError } from 'axios';
import { toast } from '../../hooks/use-toast.ts';
import { Toaster } from './ui/Toaster.tsx';

let HAD_PREVIOUS_SESSION = false;
const BookmarkForm = () => {

  const form = useForm<bookmarkFormValues>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      url: '',
      name: '',
      collection: {
        name: 'Unnamed Collection',
      },
      tags: [],
      description: '',
    },
  });

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: bookmarkFormValues) => {

      const config = await getConfig();
      const csrfToken = await getCsrfToken(config.baseUrl);
      const session = await getSession(config.baseUrl);

      HAD_PREVIOUS_SESSION = !!session;

      if (!HAD_PREVIOUS_SESSION) {
        await performLoginOrLogout(`${config.baseUrl}/api/auth/callback/credentials`, {
          username: config.username,
          password: config.password,
          redirect: false,
          csrfToken,
          callbackUrl: `${config.baseUrl}/login`,
          json: true,
        });
      }

      await postLink(config.baseUrl, values);

      if (!HAD_PREVIOUS_SESSION) {
        const url = `${config.baseUrl}/api/auth/signout`;
        await performLoginOrLogout(url, {
          username: config.username,
          password: config.password,
          redirect: false,
          csrfToken,
          callbackUrl: `${config.baseUrl}/login`,
          json: true,
        });
      }

      return;
    },
    onError: (error) => {
      if ((error as AxiosError)?.response?.status === 401) {
        toast({
          title: 'Error',
          description: 'You are not logged in. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'There was an error while trying to save the link. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    },
    onSuccess: async () => {
      return toast({
        title: 'Success',
        description: 'Link saved successfully!',
      });
    },
  });

  const { handleSubmit, control } = form;

  useEffect(() => {
    getCurrentTabInfo().then((tabInfo) => {
      form.setValue('url', tabInfo.url);
      form.setValue('name', tabInfo.title);
    });
  }, [form]);


  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(e => onSubmit(e))} className='space-y-3 py-1'>
          <FormField control={control} name='url' render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder='https://www.gooogle.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name='collection' render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Unnamed Collection' defaultValue={field.value.name ?? ''} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='LOL'>LOL</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name='tags' render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput onChange={field.onChange} value={field.value ?? []} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name='name' render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Google...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name='description' render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Description...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Separator />
          <div className='flex justify-end'>
            <Button disabled={isLoading} type='submit'>Save bookmark</Button>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  );
};


export default BookmarkForm;