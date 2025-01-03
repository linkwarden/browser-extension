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
import { getSession } from '../lib/auth/auth.ts';
// import { Checkbox } from './ui/CheckBox.tsx';

const OptionsForm = () => {
  const form = useForm<optionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: {
      baseUrl: 'https://cloud.linkwarden.app',
      username: '',
      password: '',
      syncBookmarks: false,
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
          "Either you didn't configure the extension or there was an error while trying to log out. Please try again.",
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
      const session = await getSession(
        values.baseUrl,
        values.username,
        values.password
      );

      if (session.status !== 200) {
        throw new Error('Invalid credentials');
      }

      return {
        ...values,
        data: session.data as {
          response: {
            token: string;
          };
        },
      };
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
      await saveConfig({
        baseUrl: values.baseUrl,
        defaultCollection: values.defaultCollection,
        syncBookmarks: values.syncBookmarks,
        apiKey: values.data.response.token,
      });

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
          className="space-y-3 p-2"
        >
          <FormField
            control={control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormDescription>
                  The address of the Linkwarden instance.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="https://cloud.linkwarden.app"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Commenting this since it has bugs (duplicate created when you pass another collection other than the default "Unorganized" collection) */}
          {/* <FormField
            control={control}
            name="defaultCollection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default collection</FormLabel>
                <FormDescription>
                  Default collection to add bookmarks to.
                </FormDescription>
                <FormControl>
                  <Input placeholder="Unorganized" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username or Email</FormLabel>
                <FormDescription>
                  Your Linkwarden Username or Email.
                </FormDescription>
                <FormControl>
                  <Input placeholder="johnny" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormDescription>
                  Password for your Linkwarden account.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="••••••••••••••"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={control}
            name="syncBookmarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sync Bookmarks (Experimental)</FormLabel>
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
          <div className="flex justify-between">
            <div>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/*@ts-ignore*/}
              <Button
                type="button"
                className="mb-2"
                onClick={onReset as never}
                disabled={resetLoading}
              >
                Reset
              </Button>
            </div>
            <Button disabled={isLoading} type="submit">
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
