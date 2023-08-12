import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/Form.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { optionsFormSchema, optionsFormValues } from '../lib/validators/optionsForm.ts';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { clearConfig, getConfig, isConfigured, saveConfig } from '../lib/config.ts';
import { Toaster } from './ui/Toaster.tsx';
import { toast } from '../../hooks/use-toast.ts';
import { AxiosError } from 'axios';
import { DataLogin, DataLogout, getCsrfToken, getSession, performLoginOrLogout } from '../lib/auth/auth.ts';


let HAD_PREVIOUS_SESSION = false;
const OptionsForm = () => {

  const form = useForm<optionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: {
      baseUrl: '',
      username: '',
      password: '',
    },
  });

  const { mutate: onReset, isLoading: resetLoading } = useMutation({
    mutationFn: async () => {

      // For some reason (IDK how browser works!) cookies are shared across all tabs in the same browser
      // session is shared with the extension. This means that if you log out of
      // the extension, you will also be logged out of the website. This is not
      // ideal, but I don't know how to fix it.
      // If someone knows how to fix this, please let me know.
      // For now, I will implement my own shady way to trick into thinking that
      // this behaviour never happens. I will do this by making a request to the
      // website to log out, and then make a request to the website to log in
      // again. This will trick the website into thinking that the user is still
      // logged in, but the extension will be logged out.
      // This is by far no ideal as I'm making more request to the server, but at this
      // scale I don't think it really matters. (onSubmit)

      const configured = await isConfigured();

      if (!configured) {
        return new Error('Not configured');
      }

      return;

    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Either you didn\'t configure the extension or there was an error while trying to log out. Please try again.',
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
      });
      await clearConfig();
      return;
    },
  });


  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: optionsFormValues) => {

      // Do API call to test the connection and save the values
      const { username, password } = values;
      const csrfToken = await getCsrfToken(values.baseUrl);

      const url = `${values.baseUrl}/api/auth/callback/credentials`;
      const data: DataLogin = {
        username: username,
        password: password,
        redirect: false,
        csrfToken: csrfToken,
        callbackUrl: `${values.baseUrl}/login`,
        json: true,
      };

      const session = await getSession(values.baseUrl);
      HAD_PREVIOUS_SESSION = !!session;

      await performLoginOrLogout(url, data);

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

      if (!HAD_PREVIOUS_SESSION) {
        const url = `${values.baseUrl}/api/auth/signout`;

        const data: DataLogout = {
          csrfToken: await getCsrfToken(values.baseUrl),
          callbackUrl: `${values.baseUrl}/dashboard`,
          json: true,
        };
        // If there was no previous session, we need to log out again, so we don't confuse the user
        await performLoginOrLogout(url, data);
      }
      toast({
        title: 'Saved',
        description: 'Your settings have been saved',
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
        <form onSubmit={handleSubmit(e => onSubmit(e))} className='space-y-3 p-1'>
          <FormField control={control} name='baseUrl' render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder='https://www.gooogle.com' {...field} />
              </FormControl>
              <FormDescription>
                The address of your linkwarden installation. (Without trailing slash)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name='username' render={({ field }) => (
            <FormItem>
              <FormLabel>Username/Email</FormLabel>
              <FormControl>
                <Input placeholder='Username...' {...field} />
              </FormControl>
              <FormDescription>
                Username for your linkwarden installation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name='password' render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder='Password' {...field} type='password' />
              </FormControl>
              <FormDescription>
                Password for your linkwarden installation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <div className='flex justify-between'>
            <div>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {  /*@ts-ignore*/}
              <Button type='button' className='mb-2' onClick={onReset} disabled={resetLoading}>Reset</Button>
              <p className='text-muted-foreground text-xs w-[40%]'>Click to reset config, otherwise it won't if you just
                delete
                them</p>
            </div>
            <Button disabled={isLoading} type='submit'>Save</Button>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  );
};

export default OptionsForm;