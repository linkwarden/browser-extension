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

const BookmarkForm = () => {

  const form = useForm<bookmarkFormValues>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      address: '',
      collection: 'Unnamed Collection',
      tags: [],
      description: '',
    },
  });

  function onSubmit(values: bookmarkFormValues) {
    console.log(values);
  }

  const { handleSubmit, control } = form;


  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-3 py-1'>
        <FormField control={control} name='address' render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
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
                  <SelectValue placeholder='Unnamed Collection' defaultValue={field.value ?? ''} />
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
          <Button type='submit'>Save bookmark</Button>
        </div>
      </form>
    </Form>
  );
};


export default BookmarkForm;