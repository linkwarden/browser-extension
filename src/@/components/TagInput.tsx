import { FC, useState } from 'react';
import { Button } from './ui/Button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover.tsx';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/Command.tsx';
import { cn } from '../lib/utils.ts';

interface TagInputProps {
  onChange: (tags: { name: string }[]) => void,
  value: { name: string, id?: number }[],
  tags: { id: number, name: string }[]
}


export const TagInput: FC<TagInputProps> = ({ value, onChange, tags }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  function handleAddTag() {
    if (inputValue && value.some((tagObj) => tagObj.name === inputValue)) return;
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
    <div className='min-w-full inset-x-0'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between'
          >
            {Array.isArray(value) && value.length > 0
              ? value.map((tag) => tag.name).join(', ')
              : 'Select tags...'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <div className='min-w-full inset-x-0'>
          <PopoverContent className='min-w-full p-0 overflow-y-auto max-h-[200px]'>
            <Command className='flex-grow min-w-full'>
              <CommandInput
                className='min-w-[280px]'
                placeholder='Search tag or add tag (Enter)'
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
                <CommandGroup className='w-full'>
                  {tags.map((tag: { name: string }) => (
                    <CommandItem
                      className='w-full'
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
                            : 'opacity-0',
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


  /*
    return (
      <div>
        <div className='flex space-x-2'>
          <Input value={inputValue} onChange={e => setInputValue(e.target.value)} />
          <Button type='button' onClick={handleAddTag} onKeyDown={handleAddTag}>Add</Button>
        </div>
        <div className='flex flex-wrap mt-2'>
          {tags.map(tagObj => (
            <span
              key={tagObj.name}
              className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2'
            >
              {tagObj.name}
              <button
                type='button'
                className='flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white'
                onClick={() => handleRemoveTag(tagObj.name)}
              >
                <span className='sr-only'>Remove tag</span>
                <svg className='h-2 w-2' stroke='currentColor' fill='none' viewBox='0 0 8 8'>
                  <path strokeLinecap='round' strokeWidth='1.5' d='M1 1l6 6m0-6L1 7' />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
    );*/


};
