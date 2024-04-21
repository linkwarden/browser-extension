import { useForm } from 'react-hook-form';
import {
  bookmarkFormSchema,
  bookmarkFormValues,
} from '../lib/validators/bookmarkForm.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form.tsx';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';
import { TagInput } from './TagInput.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { cn, getCurrentTabInfo } from '../lib/utils.ts';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getConfig, isConfigured } from '../lib/config.ts';
import { postLink } from '../lib/actions/links.ts';
import { AxiosError } from 'axios';
import { toast } from '../../hooks/use-toast.ts';
import { Toaster } from './ui/Toaster.tsx';
import { getCollections } from '../lib/actions/collections.ts';
import { getTags } from '../lib/actions/tags.ts';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover.tsx';
import { CaretSortIcon } from '@radix-ui/react-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/Command.tsx';
import { saveLinksInCache } from '../lib/cache.ts';

let configured = false;
const BookmarkForm = () => {
  const [openOptions, setOpenOptions] = useState<boolean>(false);
  const [openCollections, setOpenCollections] = useState<boolean>(false);
  const form = useForm<bookmarkFormValues>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      url: '',
      name: '',
      collection: {
        name: 'Unorganized',
      },
      tags: [],
      description: '',
    },
  });

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: bookmarkFormValues) => {
      const config = await getConfig();

      await postLink(config.baseUrl, values, config.apiKey);

      return;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast({
          title: 'Error',
          description:
            error.response?.data.response ||
            'There was an error while trying to save the link. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description:
            'There was an error while trying to save the link. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    },
    onSuccess: () => {
      setTimeout(() => {
        window.close();
        // I want to show some confirmation before it's closed...
      }, 3500);
      toast({
        title: 'Success',
        description: 'Link saved successfully!',
      });
    },
  });

  const { handleSubmit, control } = form;

  useEffect(() => {
    getCurrentTabInfo().then(({ url, title }) => {
      getConfig().then((config) => {
        form.setValue('url', url ? url : '');
        form.setValue('description', title ? title : '');
        // Had to be done since, name isn't required but when syncing it is. If not it looks bad!.
        form.setValue('name', title ? title : '');
        form.setValue('collection', {
          name: config.defaultCollection,
        });
      });
    });
    const getConfigUse = async () => {
      configured = await isConfigured();
    };
    getConfigUse();
  }, [form]);

  useEffect(() => {
    const syncBookmarks = async () => {
      try {
        const { syncBookmarks, baseUrl, defaultCollection } =
          await getConfig();
        form.setValue('collection', {
          name: defaultCollection,
        });
        if (!syncBookmarks) {
          return;
        }
        if (await isConfigured()) {
          await saveLinksInCache(baseUrl);
          //await syncLocalBookmarks(baseUrl);

        }
      } catch (error) {
        console.error(error);
      }
    };
    syncBookmarks();
  }, []);

  const {
    isLoading: loadingCollections,
    data: collections,
    error: collectionError,
  } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const config = await getConfig();

      const data = await getCollections(config.baseUrl, config.apiKey);

      return data.data;
    },
    enabled: configured,
  });

  const {
    isLoading: loadingTags,
    data: tags,
    error: tagsError,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const config = await getConfig();

      const data = await getTags(config.baseUrl, config.apiKey);

      return data.data;
    },
    enabled: configured,
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit((e) => onSubmit(e))} className='py-1'>
          {collectionError ? (
            <p className='text-red-600'>
              There was an error, please make sure the website is available.
            </p>
          ) : null}
          <FormField
            control={control}
            name='collection'
            render={({ field }) => (
              <FormItem className={`my-2`}>
                <FormLabel>Collection</FormLabel>
                <div className='min-w-full inset-x-0'>
                  <Popover
                    open={openCollections}
                    onOpenChange={setOpenCollections}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          aria-expanded={openCollections}
                          className={cn(
                            'w-full justify-between',
                            !field.value?.name && 'text-muted-foreground',
                          )}
                        >
                          {loadingCollections
                            ? 'Loading'
                            : field.value?.name
                              ? collections.response?.find(
                              (collection: { name: string }) =>
                                collection.name === field.value?.name,
                            )?.name || form.getValues('collection')?.name
                              : 'Select a collection...'}
                          <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    {!openOptions && openCollections ? (
                      <div
                        className={`fade-up min-w-full p-0 overflow-y-auto ${
                          openCollections
                            ? 'fixed inset-0 w-full h-full z-50 bg-white'
                            : ''
                        }`}
                      >
                        <Button
                          className='absolute top-1 right-1 bg-transparent hover:bg-transparent hover:opacity-50 transition-colors ease-in-out duration-200'
                          onClick={() => setOpenCollections(false)}
                        >
                          <X className={`h-4 w-4 text-black dark:text-white`} />
                        </Button>
                        <Command className='flex-grow min-w-full dropdown-content rounded-none'>
                          <CommandInput
                            className='min-w-[280px]'
                            placeholder='Search Collection...'
                          />
                          <CommandEmpty>No Collection found.</CommandEmpty>
                          {Array.isArray(collections?.response) && (
                            <CommandGroup className='w-full overflow-y-auto'>
                              {isLoading ? (
                                <CommandItem
                                  value='Getting collections...'
                                  key='Getting collections...'
                                  onSelect={() => {
                                    form.setValue('collection', {
                                      name: 'Unorganized',
                                    });
                                    setOpenCollections(false);
                                  }}
                                >
                                  Unorganized
                                </CommandItem>
                              ) : (
                                collections.response?.map(
                                  (collection: {
                                    name: string;
                                    id: number;
                                    ownerId: number;
                                  }) => (
                                    <CommandItem
                                      value={collection.name}
                                      key={collection.id}
                                      className='cursor-pointer'
                                      onSelect={() => {
                                        form.setValue('collection', {
                                          ownerId: collection.ownerId,
                                          id: collection.id,
                                          name: collection.name,
                                        });
                                        setOpenCollections(false);
                                      }}
                                    >
                                      {collection.name}
                                    </CommandItem>
                                  ),
                                )
                              )}
                            </CommandGroup>
                          )}
                        </Command>
                      </div>
                    ) : openOptions && openCollections ? (
                      <PopoverContent
                        className={`min-w-full p-0 overflow-y-auto max-h-[200px]`}
                      >
                        <Command className='flex-grow min-w-full dropdown-content'>
                          <CommandInput
                            className='min-w-[280px]'
                            placeholder='Search collection...'
                          />
                          <CommandEmpty>No Collection found.</CommandEmpty>
                          {Array.isArray(collections?.response) && (
                            <CommandGroup className='w-full'>
                              {isLoading ? (
                                <CommandItem
                                  value='Getting collections...'
                                  key='Getting collections...'
                                  onSelect={() => {
                                    form.setValue('collection', {
                                      name: 'Unorganized',
                                    });
                                    setOpenCollections(false);
                                  }}
                                >
                                  Unorganized
                                </CommandItem>
                              ) : (
                                collections.response?.map(
                                  (collection: {
                                    name: string;
                                    id: number;
                                    ownerId: number;
                                  }) => (
                                    <CommandItem
                                      value={collection.name}
                                      key={collection.id}
                                      onSelect={() => {
                                        form.setValue('collection', {
                                          ownerId: collection.ownerId,
                                          id: collection.id,
                                          name: collection.name,
                                        });
                                        setOpenCollections(false);
                                      }}
                                    >
                                      {collection.name}
                                    </CommandItem>
                                  ),
                                )
                              )}
                            </CommandGroup>
                          )}
                        </Command>
                      </PopoverContent>
                    ) : undefined}

                    {/* <PopoverContent
                      className={`min-w-full p-0 overflow-y-auto ${
                        !openOptions ? 'max-h-[100px]' : 'max-h-[200px]'
                      }`}
                    >
                      <Command className="flex-grow min-w-full dropdown-content">
                        <CommandInput
                          className="min-w-[280px]"
                          placeholder="Search collection..."
                        />
                        <CommandEmpty>No Collection found.</CommandEmpty>
                        {Array.isArray(collections?.response) && (
                          <CommandGroup className="w-full">
                            {isLoading ? (
                              <CommandItem
                                value="Getting collections..."
                                key="Getting collections..."
                                onSelect={() => {
                                  form.setValue('collection', {
                                    name: 'Unorganized',
                                  });
                                  setOpenCollections(false);
                                }}
                              >
                                Unorganized
                              </CommandItem>
                            ) : (
                              collections.response?.map(
                                (collection: {
                                  name: string;
                                  id: number;
                                  ownerId: number;
                                }) => (
                                  <CommandItem
                                    value={collection.name}
                                    key={collection.id}
                                    onSelect={() => {
                                      form.setValue('collection', {
                                        ownerId: collection.ownerId,
                                        id: collection.id,
                                        name: collection.name,
                                      });
                                      setOpenCollections(false);
                                    }}
                                  >
                                    {collection.name}
                                  </CommandItem>
                                )
                              )
                            )}
                          </CommandGroup>
                        )}
                      </Command>
                    </PopoverContent> */}
                  </Popover>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {openOptions ? (
            <div className='details list-none space-y-5 pt-2'>
              {tagsError ? <p>There was an error...</p> : null}
              <FormField
                control={control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    {loadingTags ? (
                      <TagInput
                        onChange={field.onChange}
                        value={[{ name: 'Getting tags...' }]}
                        tags={[{ id: 1, name: 'Getting tags...' }]}
                      />
                    ) : tagsError ? (
                      <TagInput
                        onChange={field.onChange}
                        value={[{ name: 'Not found' }]}
                        tags={[{ id: 1, name: 'Not found' }]}
                      />
                    ) : (
                      <TagInput
                        onChange={field.onChange}
                        value={field.value ?? []}
                        tags={tags.response}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Google...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Description...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : undefined}
          <div className='flex justify-between items-center mt-4'>
            <div
              className='inline-flex select-none items-center justify-center rounded-md text-sm font-medium ring-offset-background
               transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
               focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
               hover:bg-accent hover:text-accent-foreground hover:cursor-pointer p-2'
              onClick={() => setOpenOptions((prevState) => !prevState)}
            >
              {openOptions ? 'Hide' : 'More'} Options
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

export default BookmarkForm;
