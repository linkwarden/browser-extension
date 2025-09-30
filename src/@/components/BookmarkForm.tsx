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
import { SearchDropdown } from './SearchDropdown.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { checkDuplicatedItem, getCurrentTabInfo } from '../lib/utils.ts';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getConfig, isConfigured } from '../lib/config.ts';
import { postLink } from '../lib/actions/links.ts';
import { AxiosError } from 'axios';
import { toast } from '../../hooks/use-toast.ts';
import { Toaster } from './ui/Toaster.tsx';
import { getCollections } from '../lib/actions/collections.ts';
import { getTags } from '../lib/actions/tags.ts';
import { saveLinksInCache, getCachedCollections, getCachedTags, saveCachedCollections, saveCachedTags, setCacheTimestamp, isCacheValid } from '../lib/cache.ts';
import { Checkbox } from './ui/CheckBox.tsx';
import { Label } from './ui/Label.tsx';

const BookmarkForm = () => {
  const [uploadImage, setUploadImage] = useState<boolean>(false);
  const [state, setState] = useState<'capturing' | 'uploading' | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [configured, setConfigured] = useState<boolean>(false);
  const [duplicated, setDuplicated] = useState<boolean>(false);

  const handleCheckedChange = (s: boolean | 'indeterminate') => {
    if (s === 'indeterminate') return;
    setUploadImage(s);
    form.setValue('image', s ? 'png' : undefined);
  };

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
      image: undefined,
    },
  });

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: bookmarkFormValues) => {
      console.log('🚀 Starting bookmark submission with values:', values);
      console.log('📋 Tags in form before submission:', values.tags);

      const config = await getConfig();

      await postLink(
        config.baseUrl,
        uploadImage,
        values,
        setState,
        config.apiKey
      );

      return;
    },
    onError: (error) => {
      setIsSaved(false); // Reset saved state on error so user can try again
      console.error('Full error object:', error);
      if (error instanceof AxiosError) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        toast({
          title: 'Error',
          description:
            error.response?.data.response ||
            error.response?.data.message ||
            error.message ||
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
      setIsSaved(true);
      setTimeout(() => {
        window.close();
        // I want to show some confirmation before it's closed...
      }, 3500);
      toast({
        title: 'Success',
        description: 'Link saved successfully!',
        duration: 3000,
      });
    },
  });

  const { handleSubmit, control } = form;

  useEffect(() => {
    getCurrentTabInfo().then(({ url, title, description }) => {
      getConfig().then((config) => {
        form.setValue('url', url ? url : '');
        form.setValue('name', title ? title : '');
        form.setValue('description', description ? description : '');
        form.setValue('collection', {
          name: config.defaultCollection,
        });
      });
    });
    const getConfigUse = async () => {
      const isConf = await isConfigured();
      const isDup = await checkDuplicatedItem();
      setConfigured(isConf);
      setDuplicated(isDup);

      if (isConf) {
        console.log('🚀 Extension configured, ready to load data');
      }
    };
    getConfigUse();
  }, [form]);

  useEffect(() => {
    const syncBookmarks = async () => {
      try {
        const { syncBookmarks, baseUrl, defaultCollection } = await getConfig();
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
  }, [form]);

  const {
    isLoading: loadingCollections,
    data: collections,
    error: collectionError,
    refetch: refetchCollections,
  } = useQuery(['collections'], async () => {
    console.log('🔍 BookmarkForm: Fetching collections...');

    // Check if we have valid cached data (less than 60 seconds old)
    const isValid = await isCacheValid(60000); // 60 seconds

    if (isValid) {
      const cachedCollections = await getCachedCollections();
      if (cachedCollections.length > 0) {
        console.log(`📦 Using cached collections: ${cachedCollections.length} items`);
        return cachedCollections;
      }
    }

    // Cache is invalid or empty, fetch fresh data
    console.log('🌐 Fetching fresh collections from API...');
    const config = await getConfig();
    const response = await getCollections(config.baseUrl, config.apiKey);

    const sortedCollections = response.data.response.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const nameComparison = aName.localeCompare(bName);

      if (nameComparison === 0) {
        const aPath = (a.pathname || '').toLowerCase();
        const bPath = (b.pathname || '').toLowerCase();
        return aPath.localeCompare(bPath);
      }

      return nameComparison;
    });

    // Cache the results
    await saveCachedCollections(sortedCollections);
    await setCacheTimestamp(Date.now());

    console.log(`✅ Fresh collections loaded and cached: ${sortedCollections.length} items`);
    return sortedCollections;
  }, {
    enabled: configured,
    staleTime: 60000, // Consider data fresh for 60 seconds
    cacheTime: 300000, // Keep in React Query cache for 5 minutes
  });

  const {
    isLoading: loadingTags,
    data: tags,
    error: tagsError,
    refetch: refetchTags,
  } = useQuery(['tags'], async () => {
    console.log('🔍 BookmarkForm: Fetching tags...');

    // Check if we have valid cached data (less than 60 seconds old)
    const isValid = await isCacheValid(60000); // 60 seconds

    if (isValid) {
      const cachedTags = await getCachedTags();
      if (cachedTags.length > 0) {
        console.log(`📦 Using cached tags: ${cachedTags.length} items`);
        return cachedTags;
      }
    }

    // Cache is invalid or empty, fetch fresh data
    console.log('🌐 Fetching fresh tags from API...');
    const config = await getConfig();
    const response = await getTags(config.baseUrl, config.apiKey);

    const sortedTags = response.data.response.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      return aName.localeCompare(bName);
    });

    // Cache the results
    await saveCachedTags(sortedTags);
    await setCacheTimestamp(Date.now());

    console.log(`✅ Fresh tags loaded and cached: ${sortedTags.length} items`);
    return sortedTags;
  }, {
    enabled: configured,
    staleTime: 60000, // Consider data fresh for 60 seconds
    cacheTime: 300000, // Keep in React Query cache for 5 minutes
  });

  // Debug: Log current state
  console.log('🔍 BookmarkForm render state:', {
    configured,
    loadingCollections,
    loadingTags,
    collectionsCount: collections?.length || 0,
    tagsCount: tags?.length || 0,
    collections,
    tags
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit((e) => onSubmit(e))} className="py-1">
          {collectionError ? (
            <p className="text-red-600">
              There was an error, please make sure the website is available.
            </p>
          ) : null}
          <FormField
            control={control}
            name="collection"
            render={({ field }) => (
              <FormItem className={`my-2`}>
                <FormLabel>Collection</FormLabel>
                <FormControl>
                  <SearchDropdown
                    value={field.value as any}
                    onChange={field.onChange}
                    items={collections || []}
                    loading={loadingCollections}
                    onRefetch={refetchCollections}
                    placeholder="Select a collection..."
                    type="collection"
                    multiple={false}
                    displayKey="name"
                    searchKey="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="details list-none space-y-5 pt-2">
            {tagsError ? <p>There was an error...</p> : null}
            <FormField
              control={control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <SearchDropdown
                      value={(field.value || []) as any}
                      onChange={field.onChange}
                      items={(tags || []) as any}
                      loading={loadingTags}
                      onRefetch={refetchTags}
                      placeholder="Select tags..."
                      type="tags"
                      multiple={true}
                      displayKey="name"
                      searchKey="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Google..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Label className="flex items-center gap-2 w-fit cursor-pointer">
              <Checkbox
                checked={uploadImage}
                onCheckedChange={handleCheckedChange}
              />
              Upload image from browser
            </Label>
          </div>
          {duplicated && (
            <p className="text-muted text-zinc-600 dark:text-zinc-400 mt-2">
              You already have this link saved.
            </p>
          )}
          <div className="flex justify-end items-center mt-4">
            <Button disabled={isLoading || isSaved} type="submit">
              {isLoading ? 'Saving...' : isSaved ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
      <Toaster />
      {state && (
        <div className="fixed inset-0 bg-black backdrop-blur-md bg-opacity-50 flex items-center justify-center">
          <div className="text-white p-4 rounded-md flex flex-col items-center w-fit">
            <svg
              className="animate-spin h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>

            <p className="text-xl mt-1">
              {state === 'capturing'
                ? 'Capturing the page...'
                : 'Uploading image...'}
            </p>
            <p className="text-xs text-center max-w-xs">
              Please do not close this window, this may take a few seconds
              depending on the size of the page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkForm;
