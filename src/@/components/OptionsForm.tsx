import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  optionsFormSchema,
  optionsFormValues,
} from '../lib/validators/optionsForm.ts';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  clearConfig,
  getConfig,
  isConfigured,
  saveConfig,
} from '../lib/config.ts';
import { Toaster } from './ui/Toaster.tsx';
import { toast } from '../../hooks/use-toast.ts';
import { AxiosError } from 'axios';
import { clearBookmarksMetadata } from '../lib/cache.ts';
import { getCollections } from '../lib/actions/collections.ts';

const OptionsForm = () => {
  const form = useForm<optionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: {
      baseUrl: '',
      username: '',
      password: '',
      syncBookmarks: false,
      usingSSO: false,
      apiKey: '',
      defaultCollection: 'Unorganized',
    },
  });

  const { mutate: onReset, isLoading: resetLoading } = useMutation({
    mutationFn: async () => {
      const configured = await isConfigured();

      if (!configured) {
        return new Error('Not configured');
      }

      return;
    },
    onError: () => {
      toast({
        title: 'Error',
        description:
          'Either you didn\'t configure the extension or there was an error while trying to log out. Please try again.',
        variant: 'destructive',
      });
      return;
    },
    onSuccess: async () => {
      // Reset the form
      form.reset({
        baseUrl: '',
        username: '',
        password: '',
        apiKey: '',
        usingSSO: false,
        syncBookmarks: false,
        defaultCollection: 'Unorganized',
      });
      await clearConfig();
      await clearBookmarksMetadata();
      return;
    },
  });

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: optionsFormValues) => {
      values.baseUrl = values.baseUrl.replace(/\/$/, '');
      // Do API call to test the connection and save the values, cant do anymore...

      const collections = await getCollections(values.baseUrl, values.apiKey);

      if (collections.status !== 200) {
        throw new Error('Invalid credentials');
      }

      return values;
    },
    onError: (error) => {
      // Do proper errors of axios instance here
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast({
            title: 'Error',
            description: 'Invalid credentials',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Something went wrong, try again please.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong, check your values are correct.',
          variant: 'destructive',
        });
      }
    },
    onSuccess: async (values) => {
      await saveConfig(values);

      toast({
        title: 'Saved',
        description:
          'Your settings have been saved, you can now close this tab.',
        variant: 'default',
      });
    },
  });

  useEffect(() => {
    (async () => {
      const configured = await isConfigured();
      if (configured) {
        const cachedOptions = await getConfig();
        form.reset(cachedOptions);
      }
    })();
  }, [form]);

  const { handleSubmit, control } = form;

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit((e) => onSubmit(e))}
          className='space-y-3 p-2'
        >
          <FormField
            control={control}
            name='baseUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormDescription>
                  The address of your Linkwarden instance.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder='https://cloud.linkwarden.app'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='defaultCollection'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default collection</FormLabel>
                <FormDescription>
                  Default collection to add bookmarks to.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder='Unorganized'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/*<FormField
            control={control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username/Email</FormLabel>
                <FormDescription>
                  Username for your Linkwarden account.
                </FormDescription>
                <FormControl>
                  <Input placeholder='Username...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormDescription>
                Password for your Linkwarden account.
              </FormDescription>
              <FormControl>
                <Input placeholder='Password' {...field} type='password' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
          <FormField
            control={control}
            name='apiKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>API KEY</FormLabel>
                <FormDescription>
                  Api key for your Linkwarden account.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder='eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..mkTNGkl3kXDjYb54.XA29mauKrHSqwGgBk1Zb2hanecG8_c9MVPI_qv7Ge1k-UYLG5Arag5eXfVYGacu3RqVCci4NZgsBH6r16QZ5rhRzGmwkSv_PGNNzfqbAWi4k9Em8KYkc.wAZ64-qx9DaGSr0gqShnrQ' {...field}
                    type='text' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={control}
            name="syncBookmarks"
            render={({field}) => (
              <FormItem>
                <FormLabel>Sync Bookmarks</FormLabel>
                <FormDescription>
                  Sync your bookmarks with Linkwarden.
                </FormDescription>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/*<FormField
            control={control}
            name='usingSSO'
            render={({ field }) => (
              <FormItem>
                <div className='flex gap-1 items-center'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Use SSO (Leave Unchecked as Default)</FormLabel>
                </div>

                <FormDescription>
                  Enable the use of Single Sign-On instead of regular session
                  (Make sure you're already logged in to Linkwarden).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />*/}
          <div className='flex justify-between'>
            <div>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/*@ts-ignore*/}
              <Button
                type='button'
                className='mb-2'
                onClick={onReset as never}
                disabled={resetLoading}
              >
                Reset
              </Button>
            </div>
            <Button disabled={isLoading} type='submit'>
              Save
            </Button>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  );
};

export default OptionsForm;
