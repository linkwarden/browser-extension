import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/Form.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { optionsFormSchema, optionsFormValues } from '../lib/validators/optionsForm.ts';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { clearConfig, getConfig, saveConfig } from '../lib/config.ts';
import { Toaster } from './ui/Toaster.tsx';
import { toast } from '../../hooks/use-toast.ts';

const OptionsForm = () => {

  const form = useForm<optionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: {
      baseUrl: '',
      apiToken: '',
    },
  });

  const onReset = async () => {
    form.reset(
      {
        baseUrl: '',
        apiToken: '',
      },
    );
    await clearConfig();
  };

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: optionsFormValues) => {
      // Do API call to test the connection and save the values
      console.log(values);
      // Currently just save the values to test
      toast({
        title: 'Saved',
        description: 'Your settings have been saved',
        variant: 'default',
      });
      return values;
    },
    onError: (error) => {
      // Do proper errors of axios instance here
      console.log(error);
      return toast({
        title: 'There was a problem',
        description: 'Something went wrong please try again',
        variant: 'destructive',
      });
    },
    onSuccess: async (values) => {
      await saveConfig(values);
      // TESTING CONSOLE LOG CACHED VALUES
      console.log(await getConfig());

    },
  });

  useEffect(() => {
    (async () => {
      const cachedOptions = await getConfig();
      if (cachedOptions) {
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
                The address of your linkwarden installation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name='apiToken' render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder='Token' {...field} />
              </FormControl>
              <FormDescription>
                API Token from your linkwarden installation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <div className='flex justify-between'>
            <div>
              <Button type='button' className='mb-2' onClick={onReset}>Reset</Button>
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