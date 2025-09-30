import { FC, useState } from 'react';
import { Button } from './ui/Button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover.tsx';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/Command.tsx';
import { cn } from '../lib/utils.ts';

interface TagInputProps {
  onChange: (tags: { name: string }[]) => void;
  value: { name: string; id?: number }[];
  tags: { id: number; name: string }[] | undefined;
}

export const TagInput: FC<TagInputProps> = ({ value, onChange, tags }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  function handleAddTag() {
    if (inputValue && value.some((tagObj) => tagObj.name === inputValue))
      return;
    if (inputValue) {
      const newTags = [...value, { name: inputValue }];
      setInputValue('');
      onChange(newTags);
    }
  }

  function handleRemoveTag(tagName: string) {
    const newTags = value.filter((tagObj) => tagObj.name !== tagName);
    onChange(newTags);
  }

  return (
    <div className="min-w-full inset-x-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-neutral-100 dark:bg-neutral-900"
          >
            {Array.isArray(value) && value.length > 0
              ? value.map((tag) => tag.name).join(', ')
              : 'Select tags...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <div className="min-w-full inset-x-0">
          <PopoverContent className="min-w-full p-0 overflow-y-auto max-h-[200px]">
            <Command className="flex-grow min-w-full">
              <CommandInput
                className="min-w-[280px]"
                placeholder="Search tag or add tag (Enter)"
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  }
                }}
              />
              <CommandEmpty>No tag found.</CommandEmpty>
              {Array.isArray(tags) && (
                <CommandGroup className="w-full">
                  {tags
                    .filter((tag) =>
                      tag.name
                        .toLowerCase()
                        .includes(inputValue.trim().toLowerCase())
                    )
                    .map((tag: { name: string }) => (
                      <CommandItem
                        className="w-full"
                        key={tag.name}
                        onSelect={() => {
                          if (Array.isArray(value)) {
                            if (value.some((v) => v.name === tag.name)) {
                              handleRemoveTag(tag.name);
                            } else {
                              onChange([...value, tag]);
                            }
                          }
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            Array.isArray(value) &&
                              value.some((v) => v.name === tag.name)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {tag.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        </div>
      </Popover>
    </div>
  );
};
