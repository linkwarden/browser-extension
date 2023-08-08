import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/Form.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { optionsFormSchema, optionsFormValues } from '../lib/validators/optionsForm.ts';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';

const OptionsForm = () => {

  const form = useForm<optionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: {
      baseUrl: '',
      apiToken: '',
    },
  });

  const onSubmit = (values: optionsFormValues) => {
    console.log(values);
  };

  const { handleSubmit, control } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-3 p-1'>
        <FormField control={control} name='baseUrl' render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
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
        <div className='flex justify-end'>
          <Button type='submit'>Save</Button>
        </div>
      </form>
    </Form>
  );
};

export default OptionsForm;