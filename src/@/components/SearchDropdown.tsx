import { FC, useState } from 'react';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Search, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { getConfig } from '../lib/config.ts';
import { createCollection } from '../lib/actions/collections.ts';
import { createTag } from '../lib/actions/tags.ts';
import { AxiosError } from 'axios';
import { toast } from '../../hooks/use-toast.ts';
import { cn } from '../lib/utils.ts';

interface SearchItem {
  id: number;
  name: string;
  ownerId?: number;
  pathname?: string; // For collections
  [key: string]: any; // Allow dynamic property access
}

interface SearchDropdownProps {
  value: SearchItem | SearchItem[] | undefined;
  onChange: (item: SearchItem | SearchItem[]) => void;
  items: SearchItem[] | undefined;
  loading: boolean;
  onRefetch: () => void;
  placeholder?: string;
  type: 'collection' | 'tags';
  multiple?: boolean;
  displayKey?: string; // Key to use for displaying items (default: 'name')
  searchKey?: string; // Key to use for searching (default: 'name')
}

export const SearchDropdown: FC<SearchDropdownProps> = ({
  value,
  onChange,
  items,
  loading,
  onRefetch,
  placeholder = 'Search or select...',
  type,
  multiple = false,
  displayKey = 'name',
  searchKey = 'name',
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const { mutate: createNewItem } = useMutation({
    mutationFn: async (name: string) => {
      console.log(`🔄 Starting ${type} creation for:`, name);
      const config = await getConfig();

      let result;
      if (type === 'collection') {
        console.log('🏗️ Creating collection...');
        result = await createCollection(config.baseUrl, config.apiKey, { name: name.trim() });
      } else {
        console.log('🏷️ Creating tag...');
        result = await createTag(config.baseUrl, config.apiKey, { name: name.trim() });
      }

      console.log(`✅ Created ${type} result:`, result);
      return result;
    },
    onSuccess: (newItem) => {
      console.log(`Created new ${type}:`, newItem);

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const updatedValues = [...currentValues, newItem];
        console.log(`Updated ${type} values:`, updatedValues);
        onChange(updatedValues);
      } else {
        onChange(newItem);
      }
      onRefetch();
      setSearchQuery('');
      setOpen(false);
      setIsCreating(false);
      toast({
        title: 'Success',
        description: `${type === 'collection' ? 'Collection' : 'Tag'} "${newItem.name}" created successfully!`,
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error(error);
      if (error instanceof AxiosError) {
        toast({
          title: 'Error',
          description: error.response?.data.response || `Failed to create ${type}.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to create ${type}.`,
          variant: 'destructive',
        });
      }
      setIsCreating(false);
    },
  });

  const handleCreate = () => {
    if (searchQuery.trim()) {
      setIsCreating(true);
      createNewItem(searchQuery);
    }
  };

  const handleItemSelect = (item: SearchItem) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(v => v.id === item.id);

      if (isSelected) {
        // Remove item
        onChange(currentValues.filter(v => v.id !== item.id));
      } else {
        // Add item
        onChange([...currentValues, item]);
      }
    } else {
      onChange(item);
      setOpen(false);
      setSearchQuery('');
    }
  };

  // Filter and sort items based on search query
  const filteredItems = items?.filter((item: SearchItem) => {
    const searchValue = item[searchKey] || item.name;
    const pathValue = item.pathname || '';
    return (
      searchValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pathValue.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }).sort((a, b) => {
    // Sort by name first, then by pathname if available
    const aName = (a[searchKey] || a.name || '').toLowerCase();
    const bName = (b[searchKey] || b.name || '').toLowerCase();
    const nameComparison = aName.localeCompare(bName);

    // If names are equal and we have pathnames, sort by pathname
    if (nameComparison === 0 && a.pathname && b.pathname) {
      return a.pathname.toLowerCase().localeCompare(b.pathname.toLowerCase());
    }

    return nameComparison;
  }) || [];

  const showCreateOption = searchQuery.trim() &&
    !filteredItems.some((item: SearchItem) =>
      (item[searchKey] || item.name).toLowerCase() === searchQuery.toLowerCase()
    );

  const getDisplayValue = () => {
    if (loading) return 'Loading...';

    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return values.length > 0
        ? values.map(v => v[displayKey] || v.name).join(', ')
        : placeholder;
    } else {
      const singleValue = Array.isArray(value) ? value[0] : value;
      return singleValue?.[displayKey] || singleValue?.name || placeholder;
    }
  };

  const isItemSelected = (item: SearchItem) => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return values.some(v => v.id === item.id);
    } else {
      const singleValue = Array.isArray(value) ? value[0] : value;
      return singleValue?.id === item.id;
    }
  };

  return (
    <div className="relative min-w-full">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="w-full justify-between bg-neutral-100 dark:bg-neutral-900 text-sm"
        >
          {getDisplayValue()}
          <ChevronDownIcon className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`} />
        </Button>
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search or create ${type}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && showCreateOption) {
                      e.preventDefault();
                      handleCreate();
                    }
                    if (e.key === 'Escape') {
                      setOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  className="text-sm pl-8"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredItems.map((item: SearchItem) => (
                <div
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  className="px-3 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center"
                >
                  {multiple && (
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isItemSelected(item) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-xs">{item[displayKey] || item.name}</p>
                    {item.pathname && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.pathname}</p>
                    )}
                  </div>
                </div>
              ))}
              {showCreateOption && (
                <div
                  onClick={handleCreate}
                  className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2 ${
                    isCreating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                    {isCreating ? 'Creating...' : `Create "${searchQuery}"`}
                  </span>
                </div>
              )}
              {!loading && filteredItems.length === 0 && !showCreateOption && (
                <div className="px-3 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                  No {type}s found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};